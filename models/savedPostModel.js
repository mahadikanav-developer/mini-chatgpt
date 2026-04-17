const mongoose = require("mongoose");

const SavedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    collectionName: {
      type: String,
      default: "Saved",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedPost", SavedPostSchema);
