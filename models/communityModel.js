const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Farming", trim: true },
    location: { type: String, default: "Online", trim: true },
    description: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
