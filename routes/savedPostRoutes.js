const express = require("express");
const SavedPost = require("../models/savedPostModel");
const Post = require("../models/postModal");
const router = express.Router();

// Save a post
router.post("/", async (req, res) => {
  try {
    const { userId, postId, collectionName } = req.body;

    // Check if already saved
    const existing = await SavedPost.findOne({ userId, postId });
    if (existing) {
      return res.status(400).json({ message: "Post already saved" });
    }

    const savedPost = await SavedPost.create({
      userId,
      postId,
      collectionName: collectionName || "Saved",
    });

    const populated = await savedPost
      .populate("postId")
      .populate("postId.userId", "name avatar");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's saved posts
router.get("/:userId", async (req, res) => {
  try {
    const savedPosts = await SavedPost.find({
      userId: req.params.userId,
    })
      .populate("postId")
      .populate("postId.userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove saved post
router.delete("/:savedPostId", async (req, res) => {
  try {
    await SavedPost.findByIdAndDelete(req.params.savedPostId);
    res.json({ message: "Unsaved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if post is saved by user
router.get("/:userId/:postId", async (req, res) => {
  try {
    const saved = await SavedPost.findOne({
      userId: req.params.userId,
      postId: req.params.postId,
    });

    res.json({ saved: !!saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
