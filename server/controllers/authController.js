const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({ username: normalizedUsername });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    return res.json({ token, username: admin.username });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

const verify = async (req, res) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice(7).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, username: decoded.username });
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  login,
  verify
};
