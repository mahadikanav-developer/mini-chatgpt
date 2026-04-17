const express = require("express");
const Reel = require("../models/reelModel");
const User = require("../models/userModel");

const router = express.Router();

// Create reel
router.post("/", async (req, res) => {
  try {
    const { userId, videoUrl, title, description, hashtags, music } = req.body;

    const reel = await Reel.create({
      userId,
      videoUrl,
      title,
      description,
      hashtags: hashtags || [],
      music
    });

    const populatedReel = await reel.populate("userId", "name");

    res.json({ message: "Reel created", reel: populatedReel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating reel", error: err.message });
  }
});

// Get all reels (trending/feed)
router.get("/", async (req, res) => {
  try {
    const reels = await Reel.find({ isPrivate: false })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reels", error: err.message });
  }
});

// Get single reel
router.get("/:reelId", async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId)
      .populate("userId", "name")
      .populate("likes", "name")
      .populate("comments.userId", "name");

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    res.json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reel", error: err.message });
  }
});

// Like reel
router.post("/:reelId/like", async (req, res) => {
  try {
    const { reelId } = req.params;
    const { userId } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    if (reel.likes.includes(userId)) {
      reel.likes = reel.likes.filter(l => l.toString() !== userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ message: "Reel liked", likeCount: reel.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error liking reel", error: err.message });
  }
});

// Comment on reel
router.post("/:reelId/comment", async (req, res) => {
  try {
    const { reelId } = req.params;
    const { userId, text } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    reel.comments.push({ userId, text });
    await reel.save();

    res.json({ message: "Comment added", commentCount: reel.comments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// Share reel
router.post("/:reelId/share", async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findByIdAndUpdate(
      reelId,
      { $inc: { shares: 1 } },
      { new: true }
    );

    res.json({ message: "Reel shared", shareCount: reel.shares });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sharing reel", error: err.message });
  }
});

// View reel (count view)
router.post("/:reelId/view", async (req, res) => {
  try {
    const { reelId } = req.params;
    const { userId } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    if (!reel.views.includes(userId)) {
      reel.views.push(userId);
      await reel.save();
    }

    res.json({ message: "View counted", viewCount: reel.views.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error counting view", error: err.message });
  }
});

module.exports = router;
