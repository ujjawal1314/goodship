const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Order } = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');

async function backfillDrivers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB database.");

    const availablePartners = await DeliveryPartner.find({ available: true });

    if (!availablePartners.length) {
      console.log("No available delivery partners found.");
      process.exit(1);
    }

    const ordersToUpdate = await Order.find({
      status: { $in: ["Out for Delivery", "Delivered"] },
      deliveryPartner: null
    });

    console.log(`Found ${ordersToUpdate.length} orders to backfill.`);

    for (const order of ordersToUpdate) {
      const partner = availablePartners[Math.floor(Math.random() * availablePartners.length)];
      order.deliveryPartner = partner._id;
      // We are not assigning OTP here since these are already out for delivery/delivered and might have been mocked.
      // But we could assign a mock OTP if desired. We will leave deliveryOTP as null for backfilled data unless 
      // strict requirements need it. In real-world backfill you don't generate OTPs if items are already delivered.
      await order.save();
      console.log(`Assigned partner ${partner.name} to order ${order.orderId}`);
    }

    console.log("Backfill completed.");
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfillDrivers();
