const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, default: "" },
  phoneCountryCode: { type: String, default: "" },

  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },

  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  farmName: { type: String, default: "" },
  region: { type: String, default: "" },
  farmSize: { type: String, default: "" },
  crops: { type: String, default: "" }, // ✅ NEW — comma-separated e.g. "Wheat, Rice"

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  lastLogin: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  loginAttemptResetTime: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);