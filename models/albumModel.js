const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverImage: String,
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  photoCount: { type: Number, default: 0 },
  privacy: { type: String, enum: ["public", "friends", "private"], default: "public" },
  isSystemAlbum: Boolean, // Profile Pictures, Cover Photos, etc.
  location: String,
  createdDate: { type: Date, default: Date.now },
  updatedDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Album", albumSchema);
