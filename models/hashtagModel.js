const mongoose = require("mongoose");

const HashtagSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    trending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hashtag", HashtagSchema);
