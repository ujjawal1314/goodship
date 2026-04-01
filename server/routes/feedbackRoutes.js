const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getFeedbackSummary } = require("../controllers/feedbackController");

const router = express.Router();

router.get("/summary", authMiddleware, getFeedbackSummary);

module.exports = router;
