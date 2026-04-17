const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false },
  category: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  rules: [String],
  memberCount: { type: Number, default: 1 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
