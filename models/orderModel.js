const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Product details
  productName: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  unit: String,

  // Shipping details
  shippingAddress: String,
  shippingCity: String,
  shippingPhone: String,
  shippingEmail: String,

  // Payment details
  stripePaymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed"],
    default: "pending"
  },

  // Order status
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  // Timestamps
  orderDate: { type: Date, default: Date.now },
  deliveryDate: Date,
  cancelledAt: Date,
  cancelledReason: String

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
