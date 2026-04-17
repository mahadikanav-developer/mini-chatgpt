const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["business", "app", "product", "brand", "public_figure", "cause"], required: true },
  image: String,
  coverImage: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followerCount: { type: Number, default: 0 },
  website: String,
  email: String,
  phone: String,
  address: String,
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  buttonAction: String, // "book_now", "call_now", "learn_more"
  buttonLink: String,
  analyticsData: {
    totalReach: Number,
    totalEngagement: Number,
    monthlyVisitors: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Page", pageSchema);
