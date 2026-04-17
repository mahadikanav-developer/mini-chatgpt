const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: String,
  email: String,
  otp: { type: String, required: true }, // Hashed OTP
  type: {
    type: String,
    enum: ["signup", "reset", "2fa"],
    default: "signup"
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  userId: mongoose.Schema.Types.ObjectId // For password reset
});

// Auto-delete OTP after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
