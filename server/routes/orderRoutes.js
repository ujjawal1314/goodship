const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrderDeliveryDetails,
  updateOrderStatus,
  submitFeedback,
  getOrderFeedback,
  deleteOrder
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", getOrderById);
router.get("/:id/delivery", getOrderDeliveryDetails);
router.post("/:id/feedback", submitFeedback);
router.get("/:id/feedback", authMiddleware, getOrderFeedback);
router.patch("/:id", authMiddleware, updateOrderStatus);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;
