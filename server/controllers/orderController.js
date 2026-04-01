const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Order, ORDER_STATUSES } = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const { sendDeliveryPartnerEmail } = require("../utils/mailer");

const generateTransactionId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `TXN${randomPart}`;
};

const getStatusIndex = (status) => ORDER_STATUSES.indexOf(status);

const withFallbackStatusHistory = (orderDoc) => {
  const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;

  if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
    return order;
  }

  const history = [];
  const currentStatusIndex = getStatusIndex(order.status);
  if (currentStatusIndex >= 0) {
    history.push({
      status: "Confirmed",
      at: order.createdAt || new Date()
    });

    if (currentStatusIndex > 0) {
      history.push({
        status: order.status,
        at: order.updatedAt || new Date()
      });
    }
  }

  return {
    ...order,
    statusHistory: history
  };
};

const sanitizeOrder = (orderDoc) => {
  const order = withFallbackStatusHistory(orderDoc);
  const sanitized = {
    ...order,
    id: order.orderId
  };

  delete sanitized.deliveryOTP;
  return sanitized;
};

const releaseAssignedPartner = async (order, { clearPartnerReference = false } = {}) => {
  if (order.deliveryPartner) {
    const partnerId = order.deliveryPartner._id || order.deliveryPartner;
    const partner = await DeliveryPartner.findById(partnerId);
    if (partner) {
      partner.available = true;
      await partner.save();
    }
  }

  order.deliveryOTP = null;
  if (clearPartnerReference) {
    order.deliveryPartner = null;
  }
};

const assignDeliveryPartner = async (order) => {
  const availablePartners = await DeliveryPartner.find({ available: true });

  if (!availablePartners.length) {
    return { error: "No delivery partners available currently. Try again shortly." };
  }

  const partner = availablePartners[Math.floor(Math.random() * availablePartners.length)];
  const plainOTP = String(crypto.randomInt(1000, 10000));
  const deliveryOTP = await bcrypt.hash(plainOTP, 10);

  order.deliveryPartner = partner._id;
  order.deliveryOTP = deliveryOTP;

  partner.available = false;
  await partner.save();

  return { partner, plainOTP };
};

const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      date,
      price,
      productName,
      customerName,
      customerEmail,
      shippingAddress,
      billingAddress
    } = req.body;

    if (
      !orderId ||
      !date ||
      price === undefined ||
      !productName ||
      !customerName ||
      !customerEmail ||
      !shippingAddress ||
      !billingAddress
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const orderDate = new Date(date);
    if (Number.isNaN(orderDate.getTime())) {
      return res.status(400).json({ message: "Invalid order date." });
    }

    orderDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (orderDate > today) {
      return res.status(400).json({ message: "Order date cannot be in the future." });
    }

    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(409).json({ message: "Order ID already exists." });
    }

    let transactionId = generateTransactionId();
    while (await Order.findOne({ transactionId })) {
      transactionId = generateTransactionId();
    }

    const order = await Order.create({
      orderId,
      date,
      price,
      productName,
      customerName,
      customerEmail,
      shippingAddress,
      billingAddress,
      transactionId,
      statusHistory: [{ status: "Confirmed", at: new Date() }]
    });

    return res.status(201).json(sanitizeOrder(order));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order.", error: error.message });
  }
};

const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("deliveryPartner", "name phone vehicleType available")
      .sort({ createdAt: -1 });
    return res.json(orders.map((order) => sanitizeOrder(order)));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders.", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).populate(
      "deliveryPartner",
      "name phone vehicleType"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.json(sanitizeOrder(order));
  } catch (error) {
    return res.status(500).json({ message: "Failed to track order.", error: error.message });
  }
};

const getOrderDeliveryDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).populate(
      "deliveryPartner",
      "name phone vehicleType"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "Out for Delivery" || !order.deliveryPartner) {
      return res.status(400).json({ message: "Delivery details not available at this stage" });
    }

    return res.json({
      partnerName: order.deliveryPartner.name,
      partnerPhone: order.deliveryPartner.phone,
      vehicleType: order.deliveryPartner.vehicleType,
      hasDeliveryOTP: true
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load delivery details.", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findOne({ orderId: req.params.id }).populate(
      "deliveryPartner",
      "name phone vehicleType available"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const previousStatus = order.status;
    const previousStatusIndex = getStatusIndex(previousStatus);
    const nextStatusIndex = getStatusIndex(status);

    if (previousStatus === "Out for Delivery" && status !== "Out for Delivery") {
      await releaseAssignedPartner(order, {
        clearPartnerReference: status !== "Delivered" && nextStatusIndex < previousStatusIndex
      });
    }

    let assignedPartner = null;
    let plainOTP = null;

    if (status === "Out for Delivery" && previousStatus !== "Out for Delivery") {
      const assignment = await assignDeliveryPartner(order);
      if (assignment.error) {
        return res.status(400).json({ message: assignment.error });
      }
      assignedPartner = assignment.partner;
      plainOTP = assignment.plainOTP;
    }

    order.status = status;
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    const alreadyLogged = order.statusHistory.some((entry) => entry.status === status);
    if (!alreadyLogged) {
      order.statusHistory.push({ status, at: new Date() });
    }

    await order.save();

    if (assignedPartner && plainOTP) {
      await sendDeliveryPartnerEmail(
        order.customerEmail,
        assignedPartner.name,
        assignedPartner.phone,
        assignedPartner.vehicleType,
        plainOTP
      );
    }

    const updatedOrder = await Order.findById(order._id).populate(
      "deliveryPartner",
      "name phone vehicleType available"
    );
    return res.json(sanitizeOrder(updatedOrder));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { overallRating, deliveryPartnerRating, comment, wouldRecommend } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Feedback can only be submitted for delivered orders" });
    }

    if (order.feedback?.submittedAt) {
      return res.status(409).json({ message: "Feedback already submitted for this order" });
    }

    const overall = Number(overallRating);
    const delivery = Number(deliveryPartnerRating);

    if (
      !Number.isInteger(overall) ||
      overall < 1 ||
      overall > 5 ||
      !Number.isInteger(delivery) ||
      delivery < 1 ||
      delivery > 5
    ) {
      return res.status(400).json({ message: "Ratings must be between 1 and 5" });
    }

    order.feedback = {
      overallRating: overall,
      deliveryPartnerRating: delivery,
      comment: comment?.trim() || null,
      wouldRecommend: typeof wouldRecommend === "boolean" ? wouldRecommend : null,
      submittedAt: new Date()
    };

    await order.save();
    return res.status(200).json({ success: true, message: "Thank you for your feedback!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit feedback.", error: error.message });
  }
};

const getOrderFeedback = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).select("feedback");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!order.feedback?.submittedAt) {
      return res.status(404).json({ message: "No feedback submitted yet" });
    }

    return res.json(order.feedback);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load feedback.", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.json({ message: "Order deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete order.", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrderDeliveryDetails,
  updateOrderStatus,
  submitFeedback,
  getOrderFeedback,
  deleteOrder
};
