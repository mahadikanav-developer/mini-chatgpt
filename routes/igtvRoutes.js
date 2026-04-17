const express = require("express");
const IGTV = require("../models/igtvModel");
const User = require("../models/userModel");

const router = express.Router();

// Create IGTV video
router.post("/", async (req, res) => {
  try {
    const { userId, videoUrl, title, description, series, hashtags } = req.body;

    const video = await IGTV.create({
      userId,
      videoUrl,
      title,
      description,
      series,
      hashtags: hashtags || []
    });

    const populatedVideo = await video.populate("userId", "name");

    res.json({ message: "IGTV video created", video: populatedVideo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating IGTV video", error: err.message });
  }
});

// Get all IGTV videos
router.get("/", async (req, res) => {
  try {
    const videos = await IGTV.find({ isPrivate: false })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching IGTV videos", error: err.message });
  }
});

// Get channel (user's IGTV videos)
router.get("/channel/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await IGTV.find({ userId, isPrivate: false })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching channel videos", error: err.message });
  }
});

// Get single IGTV video
router.get("/:videoId", async (req, res) => {
  try {
    const video = await IGTV.findById(req.params.videoId)
      .populate("userId", "name")
      .populate("likes", "name")
      .populate("comments.userId", "name");

    if (!video) {
      return res.status(404).json({ message: "IGTV video not found" });
    }

    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching IGTV video", error: err.message });
  }
});

// Like IGTV video
router.post("/:videoId/like", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;

    const video = await IGTV.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "IGTV video not found" });
    }

    if (video.likes.includes(userId)) {
      video.likes = video.likes.filter(l => l.toString() !== userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json({ message: "IGTV video liked", likeCount: video.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error liking video", error: err.message });
  }
});

// Comment on IGTV video
router.post("/:videoId/comment", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId, text } = req.body;

    const video = await IGTV.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "IGTV video not found" });
    }

    video.comments.push({ userId, text });
    await video.save();

    res.json({ message: "Comment added", commentCount: video.comments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// View count
router.post("/:videoId/view", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;

    const video = await IGTV.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "IGTV video not found" });
    }

    if (!video.views.includes(userId)) {
      video.views.push(userId);
      await video.save();
    }

    res.json({ message: "View counted", viewCount: video.views.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error counting view", error: err.message });
  }
});

module.exports = router;
