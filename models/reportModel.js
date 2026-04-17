const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post",
    default: null
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    default: null
  },
  reason: { 
    type: String, 
    enum: [
      "spam",
      "harassment",
      "hate_speech",
      "violence",
      "sexual_content",
      "misinformation",
      "copyright",
      "other"
    ],
    required: true 
  },
  description: String,
  status: { 
    type: String, 
    enum: ["pending", "reviewed", "resolved", "dismissed"],
    default: "pending"
  },
  reportedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  reviewedAt: Date,
  reviewNotes: String
});

module.exports = mongoose.model("Report", reportSchema);
