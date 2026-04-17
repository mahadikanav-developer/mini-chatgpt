const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: String,
    image: String,
    bgColor: {
      type: String,
      default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Auto-delete stories after 24 hours
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Story", StorySchema);
