const express = require("express");
const { getPartners } = require("../controllers/partnerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getPartners);

module.exports = router;
