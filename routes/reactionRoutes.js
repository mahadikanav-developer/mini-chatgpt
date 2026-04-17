const express = require("express");
const Reaction = require("../models/reactionModel");
const Post = require("../models/postModal");

const router = express.Router();

// React to post
router.post("/:postId/react", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, type } = req.body;

    // Check if user already reacted
    let existingReaction = await Reaction.findOne({ postId, userId });

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.type === type) {
        await Reaction.deleteOne({ _id: existingReaction._id });
        res.json({ message: "Reaction removed" });
      } else {
        // Change reaction type
        existingReaction.type = type;
        await existingReaction.save();
        res.json({ message: "Reaction updated", reaction: existingReaction });
      }
    } else {
      // Create new reaction
      const reaction = await Reaction.create({
        postId,
        userId,
        type
      });
      res.json({ message: "Reaction added", reaction });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reacting to post", error: err.message });
  }
});

// Get reactions on post
router.get("/:postId/reactions", async (req, res) => {
  try {
    const { postId } = req.params;

    const reactions = await Reaction.find({ postId })
      .populate("userId", "name");

    // Count by type
    const counts = {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };

    reactions.forEach(r => {
      if (counts.hasOwnProperty(r.type)) {
        counts[r.type]++;
      }
    });

    res.json({
      total: reactions.length,
      counts,
      reactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reactions", error: err.message });
  }
});

// Get user's reaction on post
router.get("/:postId/user-reaction/:userId", async (req, res) => {
  try {
    const { postId, userId } = req.params;

    const reaction = await Reaction.findOne({ postId, userId });

    if (reaction) {
      res.json({ hasReaction: true, type: reaction.type });
    } else {
      res.json({ hasReaction: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user reaction", error: err.message });
  }
});

module.exports = router;
