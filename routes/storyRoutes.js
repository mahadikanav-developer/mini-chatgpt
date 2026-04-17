const express = require("express");
const Story = require("../models/storyModel");
const router = express.Router();

// Create a story
router.post("/", async (req, res) => {
  try {
    const { userId, text, image, bgColor, textColor } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const story = await Story.create({
      userId,
      text,
      image: image || "",
      bgColor: bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textColor: textColor || "#ffffff",
      views: [],
    });

    const populatedStory = await story.populate("userId", "name avatar farmName");
    res.json(populatedStory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active stories (from user's followers + their own)
router.get("/feed/:userId", async (req, res) => {
  try {
    const stories = await Story.find().populate("userId", "name avatar farmName").sort({ createdAt: -1 }).lean();

    // Filter to only stories less than 24 hours old
    const now = new Date();
    const activeStories = stories.filter(story => {
      const age = (now - new Date(story.createdAt)) / 1000 / 60 / 60; // hours
      return age < 24;
    });

    res.json(activeStories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stories from a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.params.userId })
      .populate("userId", "name avatar farmName")
      .sort({ createdAt: -1 })
      .lean();

    // Filter to only stories less than 24 hours old
    const now = new Date();
    const activeStories = stories.filter(story => {
      const age = (now - new Date(story.createdAt)) / 1000 / 60 / 60; // hours
      return age < 24;
    });

    res.json(activeStories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add view to story
router.post("/:storyId/view", async (req, res) => {
  try {
    const { viewerId } = req.body;
    const story = await Story.findById(req.params.storyId);

    if (!story.views.includes(viewerId)) {
      story.views.push(viewerId);
      await story.save();
    }

    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a story
router.delete("/:storyId", async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.storyId);
    res.json({ message: "Story deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
