const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  blockedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  reason: String,
  blockedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevent duplicate blocks
blockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

module.exports = mongoose.model("Block", blockSchema);
