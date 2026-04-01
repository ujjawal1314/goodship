// Run once from the server directory with: node seeds/orderSeed.js
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { Order } = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sampleOrders = [
  {
    orderId: "GS-1001",
    date: new Date("2026-03-15"),
    price: 1299,
    productName: "Wireless Bluetooth Earbuds",
    customerName: "Ravi Kumar",
    customerEmail: "ravi.kumar@example.com",
    transactionId: "TXN-20260315-001",
    shippingAddress: "12 MG Road, Bengaluru, Karnataka 560001",
    billingAddress: "12 MG Road, Bengaluru, Karnataka 560001",
    status: "Delivered"
  },
  {
    orderId: "GS-1002",
    date: new Date("2026-03-16"),
    price: 499,
    productName: "USB-C Fast Charger",
    customerName: "Sneha Patel",
    customerEmail: "sneha.patel@example.com",
    transactionId: "TXN-20260316-002",
    shippingAddress: "45 SG Highway, Ahmedabad, Gujarat 380015",
    billingAddress: "45 SG Highway, Ahmedabad, Gujarat 380015",
    status: "Delivered"
  },
  {
    orderId: "GS-1003",
    date: new Date("2026-03-18"),
    price: 3499,
    productName: "Noise Cancelling Headphones",
    customerName: "Amit Sharma",
    customerEmail: "amit.sharma@example.com",
    transactionId: "TXN-20260318-003",
    shippingAddress: "78 Connaught Place, New Delhi 110001",
    billingAddress: "78 Connaught Place, New Delhi 110001",
    status: "Out for Delivery"
  },
  {
    orderId: "GS-1004",
    date: new Date("2026-03-20"),
    price: 899,
    productName: "Phone Case - Premium Leather",
    customerName: "Priya Nair",
    customerEmail: "priya.nair@example.com",
    transactionId: "TXN-20260320-004",
    shippingAddress: "22 Marine Drive, Mumbai, Maharashtra 400002",
    billingAddress: "22 Marine Drive, Mumbai, Maharashtra 400002",
    status: "Shipped"
  },
  {
    orderId: "GS-1005",
    date: new Date("2026-03-21"),
    price: 15999,
    productName: "Smartwatch Pro",
    customerName: "Vikram Singh",
    customerEmail: "vikram.singh@example.com",
    transactionId: "TXN-20260321-005",
    shippingAddress: "9 Civil Lines, Jaipur, Rajasthan 302006",
    billingAddress: "9 Civil Lines, Jaipur, Rajasthan 302006",
    status: "Shipped"
  },
  {
    orderId: "GS-1006",
    date: new Date("2026-03-22"),
    price: 2199,
    productName: "Portable Bluetooth Speaker",
    customerName: "Anita Desai",
    customerEmail: "anita.desai@example.com",
    transactionId: "TXN-20260322-006",
    shippingAddress: "33 FC Road, Pune, Maharashtra 411004",
    billingAddress: "33 FC Road, Pune, Maharashtra 411004",
    status: "Processing"
  },
  {
    orderId: "GS-1007",
    date: new Date("2026-03-23"),
    price: 749,
    productName: "Wireless Mouse",
    customerName: "Deepak Menon",
    customerEmail: "deepak.menon@example.com",
    transactionId: "TXN-20260323-007",
    shippingAddress: "56 Park Street, Kolkata, West Bengal 700016",
    billingAddress: "56 Park Street, Kolkata, West Bengal 700016",
    status: "Confirmed"
  },
  {
    orderId: "GS-1008",
    date: new Date("2026-03-24"),
    price: 4999,
    productName: "Mechanical Keyboard RGB",
    customerName: "Kavita Joshi",
    customerEmail: "kavita.joshi@example.com",
    transactionId: "TXN-20260324-008",
    shippingAddress: "11 Anna Salai, Chennai, Tamil Nadu 600002",
    billingAddress: "11 Anna Salai, Chennai, Tamil Nadu 600002",
    status: "Confirmed"
  },
  {
    orderId: "GS-1009",
    date: new Date("2026-03-25"),
    price: 1799,
    productName: "Power Bank 20000mAh",
    customerName: "Rajesh Iyer",
    customerEmail: "rajesh.iyer@example.com",
    transactionId: "TXN-20260325-009",
    shippingAddress: "67 Brigade Road, Bengaluru, Karnataka 560025",
    billingAddress: "67 Brigade Road, Bengaluru, Karnataka 560025",
    status: "Delivered"
  },
  {
    orderId: "GS-1010",
    date: new Date("2026-03-26"),
    price: 599,
    productName: "Laptop Stand - Aluminum",
    customerName: "Meera Kapoor",
    customerEmail: "meera.kapoor@example.com",
    transactionId: "TXN-20260326-010",
    shippingAddress: "88 Hazratganj, Lucknow, Uttar Pradesh 226001",
    billingAddress: "88 Hazratganj, Lucknow, Uttar Pradesh 226001",
    status: "Out for Delivery"
  },
  {
    orderId: "GS-1011",
    date: new Date("2026-03-27"),
    price: 8999,
    productName: "Tablet 10-inch HD",
    customerName: "Suresh Reddy",
    customerEmail: "suresh.reddy@example.com",
    transactionId: "TXN-20260327-011",
    shippingAddress: "14 Banjara Hills, Hyderabad, Telangana 500034",
    billingAddress: "14 Banjara Hills, Hyderabad, Telangana 500034",
    status: "Shipped"
  },
  {
    orderId: "GS-1012",
    date: new Date("2026-03-28"),
    price: 349,
    productName: "Screen Protector Pack (3x)",
    customerName: "Neha Gupta",
    customerEmail: "neha.gupta@example.com",
    transactionId: "TXN-20260328-012",
    shippingAddress: "23 Sector 17, Chandigarh 160017",
    billingAddress: "23 Sector 17, Chandigarh 160017",
    status: "Processing"
  },
  {
    orderId: "GS-1013",
    date: new Date("2026-03-29"),
    price: 6499,
    productName: "Webcam 4K Ultra HD",
    customerName: "Arjun Malhotra",
    customerEmail: "arjun.malhotra@example.com",
    transactionId: "TXN-20260329-013",
    shippingAddress: "5 Mall Road, Shimla, Himachal Pradesh 171001",
    billingAddress: "5 Mall Road, Shimla, Himachal Pradesh 171001",
    status: "Confirmed"
  },
  {
    orderId: "GS-1014",
    date: new Date("2026-03-30"),
    price: 1999,
    productName: "Smart LED Desk Lamp",
    customerName: "Pooja Bhatia",
    customerEmail: "pooja.bhatia@example.com",
    transactionId: "TXN-20260330-014",
    shippingAddress: "41 Residency Road, Indore, Madhya Pradesh 452001",
    billingAddress: "41 Residency Road, Indore, Madhya Pradesh 452001",
    status: "Shipped"
  },
  {
    orderId: "GS-1015",
    date: new Date("2026-03-31"),
    price: 2499,
    productName: "External SSD 500GB",
    customerName: "Karan Bhatia",
    customerEmail: "karan.bhatia@example.com",
    transactionId: "TXN-20260331-015",
    shippingAddress: "19 Lal Darwaza, Ahmedabad, Gujarat 380001",
    billingAddress: "19 Lal Darwaza, Ahmedabad, Gujarat 380001",
    status: "Delivered"
  }
];

// Build status history based on the final status
function buildStatusHistory(finalStatus, orderDate) {
  const allStatuses = ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
  const idx = allStatuses.indexOf(finalStatus);
  const history = [];
  for (let i = 0; i <= idx; i++) {
    history.push({
      status: allStatuses[i],
      at: new Date(orderDate.getTime() + i * 24 * 60 * 60 * 1000) // +1 day per step
    });
  }
  return history;
}

const runSeed = async () => {
  try {
    await connectDB();

    // Fetch delivery partners to assign to orders
    const partners = await DeliveryPartner.find();
    if (partners.length === 0) {
      console.error("No delivery partners found. Run seed:delivery-partners first.");
      process.exitCode = 1;
      return;
    }

    for (let i = 0; i < sampleOrders.length; i++) {
      const order = sampleOrders[i];

      const existing = await Order.findOne({ orderId: order.orderId });
      if (existing) {
        console.log(`Skipping existing order: ${order.orderId}`);
        continue;
      }

      // Assign a delivery partner (round-robin) for orders that are Shipped or beyond
      const statusesWithPartner = ["Shipped", "Out for Delivery", "Delivered"];
      const assignPartner = statusesWithPartner.includes(order.status);

      await Order.create({
        ...order,
        deliveryPartner: assignPartner ? partners[i % partners.length]._id : null,
        statusHistory: buildStatusHistory(order.status, order.date)
      });
      console.log(`Inserted order: ${order.orderId} — ${order.productName}`);
    }

    console.log("Order seed complete.");
  } catch (error) {
    console.error("Order seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
