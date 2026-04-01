// Run once from the server directory with: node seeds/deliveryPartnerSeed.js
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DeliveryPartner = require("../models/DeliveryPartner");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const deliveryPartners = [
  ["Aarav Sharma", "9876543210", "Bike"],
  ["Vivaan Gupta", "9876543211", "Scooter"],
  ["Aditya Verma", "9876543212", "Van"],
  ["Ishaan Nair", "9876543213", "Bike"],
  ["Krish Malhotra", "9876543214", "Scooter"],
  ["Rohan Mehta", "9876543215", "Van"],
  ["Arjun Rao", "9876543216", "Bike"],
  ["Siddharth Iyer", "9876543217", "Scooter"],
  ["Harsh Patel", "9876543218", "Bike"],
  ["Karan Bhatia", "9876543219", "Van"],
  ["Neha Joshi", "9876543220", "Scooter"],
  ["Priya Singh", "9876543221", "Bike"],
  ["Ananya Das", "9876543222", "Scooter"],
  ["Meera Kapoor", "9876543223", "Van"],
  ["Sneha Reddy", "9876543224", "Bike"]
].map(([name, phone, vehicleType]) => ({ name, phone, vehicleType }));

const seedDeliveryPartners = async () => {
  try {
    await connectDB();

    for (const partner of deliveryPartners) {
      const existingPartner = await DeliveryPartner.findOne({ phone: partner.phone });
      if (existingPartner) {
        console.log(`Skipping existing delivery partner: ${partner.name}`);
        continue;
      }

      await DeliveryPartner.create(partner);
      console.log(`Inserted delivery partner: ${partner.name}`);
    }

    console.log("Delivery partner seed complete.");
  } catch (error) {
    console.error("Delivery partner seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDeliveryPartners();
