const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: String,
  title: String,
  description: String,
  duration: Number, // in seconds
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  shares: Number,
  music: {
    title: String,
    artist: String,
    audioUrl: String
  },
  hashtags: [String],
  isPrivate: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  allowDuet: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Reel", reelSchema);
