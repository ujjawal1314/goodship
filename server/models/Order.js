const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true
    },
    billingAddress: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Confirmed"
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null
    },
    feedback: {
      overallRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      deliveryPartnerRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      comment: {
        type: String,
        default: null
      },
      wouldRecommend: {
        type: Boolean,
        default: null
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ORDER_STATUSES,
          required: true
        },
        at: {
          type: Date,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = {
  Order: mongoose.model("Order", orderSchema),
  ORDER_STATUSES
};
