// Run once from the server directory with: node seeds/adminSeed.js
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAdmins = [
  { username: "ujjwal", password: "ujjwal" },
  { username: "akash", password: "akash" },
  { username: "ryan", password: "1234567890" }
];

const runSeed = async () => {
  try {
    await connectDB();

    for (const admin of seedAdmins) {
      const existingAdmin = await Admin.findOne({ username: admin.username });
      if (existingAdmin) {
        console.log(`Skipping existing admin: ${admin.username}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.create({
        username: admin.username,
        password: hashedPassword
      });
      console.log(`Inserted admin: ${admin.username}`);
    }

    console.log("Admin seed complete.");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
