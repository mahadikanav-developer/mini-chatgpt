const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  text: String,
  image: String,
  crop: String,

  // Marketplace fields
  type: { type: String, enum: ["update", "question", "tip", "market"], default: "update" },
  price: Number,
  unit: String,
  location: String,
  contact: String,

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Comments
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);