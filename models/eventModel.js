const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  location: String,
  category: String,
  attending: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  interested: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notGoing: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isOnline: Boolean,
  link: String,
  privacy: { type: String, enum: ["public", "private", "friends"], default: "public" }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
