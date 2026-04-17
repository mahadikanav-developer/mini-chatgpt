const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["like", "love", "haha", "wow", "sad", "angry"], 
    default: "like"
  },
  createdAt: { type: Date, default: Date.now }
});

// Unique index: only one reaction per user per post
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);
