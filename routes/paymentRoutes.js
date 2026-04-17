const express = require("express");
let stripe;
try {
  const Stripe = require("stripe");
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} catch (err) {
  // Keep server booting even if Stripe package is missing.
  stripe = null;
}
const Order = require("../models/orderModel");
const Post = require("../models/postModal");
const User = require("../models/userModel");

const router = express.Router();

function ensureStripeConfigured(res) {
  if (!stripe) {
    res.status(503).json({
      message: "Payments are temporarily unavailable. Stripe dependency is missing."
    });
    return false;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({
      message: "Payments are temporarily unavailable. STRIPE_SECRET_KEY is not configured."
    });
    return false;
  }
  return true;
}

// Create payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) {
      return;
    }

    const { postId, buyerId, quantity, shippingAddress, shippingCity, shippingPhone, shippingEmail } = req.body;

    // Validate input
    if (!postId || !buyerId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid order details" });
    }

    // Get post details
    const post = await Post.findById(postId).populate("userId");
    if (!post || post.type !== "market") {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify buyer exists
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Calculate total price (in cents for Stripe)
    const totalPrice = post.price * quantity;
    const amountInCents = Math.round(totalPrice * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        postId,
        buyerId,
        quantity,
        sellerId: post.userId._id.toString()
      }
    });

    // Create order in database
    const order = await Order.create({
      buyerId,
      postId,
      sellerId: post.userId._id,
      productName: post.text?.substring(0, 100) || "Product",
      quantity,
      unitPrice: post.price,
      totalPrice,
      unit: post.unit,
      shippingAddress,
      shippingCity,
      shippingPhone,
      shippingEmail,
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "pending"
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: totalPrice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating payment intent", error: err.message });
  }
});

// Confirm payment
router.post("/confirm-payment", async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) {
      return;
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update order status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "succeeded",
        orderStatus: "confirmed"
      });

      // Send notification to seller
      const order = await Order.findById(orderId);
      if (order) {
        // TODO: Create notification for seller
        console.log(`Order notification sent to seller ${order.sellerId}`);
      }

      res.json({ message: "Payment confirmed", status: "succeeded" });
    } else {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "failed"
      });
      res.status(400).json({ message: "Payment not confirmed", status: paymentIntent.status });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error confirming payment", error: err.message });
  }
});

// Get user's orders (buyer)
router.get("/my-orders/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;

    const orders = await Order.find({ buyerId })
      .populate("postId", "text price unit")
      .populate("sellerId", "name")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// Get user's sales (seller)
router.get("/my-sales/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ sellerId, paymentStatus: "succeeded" })
      .populate("buyerId", "name")
      .populate("postId", "text price unit")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching sales", error: err.message });
  }
});

// Get single order
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .populate("postId", "text price unit");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
});

// Update order status
router.patch("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, deliveryDate } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, deliveryDate },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

// Cancel order
router.post("/:orderId/cancel", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation if payment not succeeded
    if (order.paymentStatus === "succeeded") {
      return res.status(400).json({ message: "Cannot cancel confirmed payment" });
    }

    await Order.findByIdAndUpdate(orderId, {
      orderStatus: "cancelled",
      cancelledAt: new Date(),
      cancelledReason: reason
    });

    res.json({ message: "Order cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error cancelling order", error: err.message });
  }
});

module.exports = router;
