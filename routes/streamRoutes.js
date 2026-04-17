const express = require("express");
const Stream = require("../models/streamModel");
const User = require("../models/userModel");

const router = express.Router();

// Start a live stream
router.post("/start", async (req, res) => {
  try {
    const { streamerId, title, description, category, tags } = req.body;

    // Verify user exists
    const streamer = await User.findById(streamerId);
    if (!streamer) {
      return res.status(404).json({ message: "Streamer not found" });
    }

    // Check if user already has active stream
    const activeStream = await Stream.findOne({
      streamerId,
      status: "live"
    });

    if (activeStream) {
      return res.status(400).json({ message: "User already has an active stream" });
    }

    // Create new stream
    const stream = await Stream.create({
      streamerId,
      title: title || "Live Stream",
      description,
      category,
      tags: tags || [],
      startTime: new Date(),
      viewerCount: 0
    });

    // Populate streamer info
    const populatedStream = await stream.populate("streamerId", "name");

    res.json({ message: "Stream started", stream: populatedStream });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error starting stream", error: err.message });
  }
});

// Get all active streams
router.get("/active", async (req, res) => {
  try {
    const streams = await Stream.find({ status: "live" })
      .populate("streamerId", "name")
      .sort({ startTime: -1 });

    res.json(streams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching streams", error: err.message });
  }
});

// Get streamer's active stream
router.get("/user/:streamerId", async (req, res) => {
  try {
    const { streamerId } = req.params;

    const stream = await Stream.findOne({
      streamerId,
      status: "live"
    }).populate("streamerId", "name");

    if (!stream) {
      return res.status(404).json({ message: "No active stream for this user" });
    }

    res.json(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stream", error: err.message });
  }
});

// Join stream (add viewer)
router.post("/:streamId/join", async (req, res) => {
  try {
    const { streamId } = req.params;
    const { userId } = req.body;

    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    // Add viewer if not already added
    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      stream.viewerCount = stream.viewers.length;
      await stream.save();
    }

    res.json({ message: "Joined stream", viewerCount: stream.viewerCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error joining stream", error: err.message });
  }
});

// Leave stream (remove viewer)
router.post("/:streamId/leave", async (req, res) => {
  try {
    const { streamId } = req.params;
    const { userId } = req.body;

    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    // Remove viewer
    stream.viewers = stream.viewers.filter(v => v.toString() !== userId);
    stream.viewerCount = stream.viewers.length;
    await stream.save();

    res.json({ message: "Left stream", viewerCount: stream.viewerCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error leaving stream", error: err.message });
  }
});

// Add chat message to stream
router.post("/:streamId/chat", async (req, res) => {
  try {
    const { streamId } = req.params;
    const { userId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text required" });
    }

    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    // Add comment to stream
    stream.comments.push({
      userId,
      text
    });

    await stream.save();

    // Populate user info
    const user = await User.findById(userId, "name");

    res.json({
      message: "Comment added",
      comment: {
        userId,
        text,
        userName: user?.name,
        createdAt: new Date()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// Get stream chat/comments
router.get("/:streamId/chat", async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await Stream.findById(streamId)
      .populate("comments.userId", "name");

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(stream.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching chat", error: err.message });
  }
});

// End stream
router.post("/:streamId/end", async (req, res) => {
  try {
    const { streamId } = req.params;
    const { streamerId } = req.body;

    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    // Verify streamer ownership
    if (stream.streamerId.toString() !== streamerId) {
      return res.status(403).json({ message: "Not authorized to end this stream" });
    }

    // Update stream status
    const endTime = new Date();
    const duration = Math.floor((endTime - stream.startTime) / 1000); // seconds

    stream.status = "ended";
    stream.endTime = endTime;
    stream.duration = duration;

    await stream.save();

    res.json({ 
      message: "Stream ended", 
      stream,
      duration: `${Math.floor(duration / 60)} minutes`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error ending stream", error: err.message });
  }
});

// Get user's stream history
router.get("/history/:streamerId", async (req, res) => {
  try {
    const { streamerId } = req.params;

    const streams = await Stream.find({ streamerId, status: "ended" })
      .sort({ endTime: -1 })
      .limit(20);

    res.json(streams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
});

// Get stream by ID
router.get("/:streamId", async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await Stream.findById(streamId)
      .populate("streamerId", "name")
      .populate("viewers", "name");

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stream", error: err.message });
  }
});

module.exports = router;
