const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  streamerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  
  // Stream status
  status: {
    type: String,
    enum: ["live", "ended"],
    default: "live"
  },
  
  // Stream statistics
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  viewerCount: { type: Number, default: 0 },
  
  // Timestamps
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number, // in seconds
  
  // Comments/Chat
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Stream metadata
  category: String,
  tags: [String],
  isPrivate: { type: Boolean, default: false },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Recording
  recordingUrl: String,
  isRecorded: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Stream", streamSchema);
