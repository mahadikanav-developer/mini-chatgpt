const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/userModel");

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Storage config with better naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const type = req.body.type || "file"; // avatar, post, story, etc.
    cb(null, `${type}_${Date.now()}${ext}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Upload avatar
router.post("/users/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const fullAvatarUrl = `http://localhost:5000${avatarUrl}`;

    await User.findByIdAndUpdate(userId, {
      avatar: fullAvatarUrl
    });

    res.json({
      message: "Avatar uploaded",
      avatar: fullAvatarUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload post image
router.post("/posts/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const fullImageUrl = `http://localhost:5000${imageUrl}`;
    
    res.json({
      message: "Image uploaded",
      image: fullImageUrl,
      filename: req.file.filename
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Upload story image/video
router.post("/stories/media", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const mediaUrl = `/uploads/${req.file.filename}`;
    const fullMediaUrl = `http://localhost:5000${mediaUrl}`;
    
    res.json({
      message: "Media uploaded",
      media: fullMediaUrl,
      filename: req.file.filename
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
