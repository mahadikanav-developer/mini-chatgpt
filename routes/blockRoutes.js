const express = require("express");
const Block = require("../models/blockModel");
const User = require("../models/userModel");

const router = express.Router();

// Block a user
router.post("/:userId/block", async (req, res) => {
  try {
    const { blockedUserId, reason } = req.body;
    const userId = req.params.userId;

    // Prevent users from blocking themselves
    if (userId === blockedUserId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    // Check if user exists
    const blockedUser = await User.findById(blockedUserId);
    if (!blockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({ userId, blockedUserId });
    if (existingBlock) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Create block
    const block = await Block.create({
      userId,
      blockedUserId,
      reason
    });

    res.json({ message: "User blocked successfully", block });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error blocking user", error: err.message });
  }
});

// Unblock a user
router.delete("/:userId/unblock/:blockedUserId", async (req, res) => {
  try {
    const { userId, blockedUserId } = req.params;

    const result = await Block.findOneAndDelete({ userId, blockedUserId });

    if (!result) {
      return res.status(404).json({ message: "Block not found" });
    }

    res.json({ message: "User unblocked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unblocking user", error: err.message });
  }
});

// Get user's blocked list
router.get("/:userId/blocked-list", async (req, res) => {
  try {
    const { userId } = req.params;

    const blockedUsers = await Block.find({ userId })
      .populate("blockedUserId", "name avatar")
      .sort({ blockedAt: -1 });

    res.json(blockedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching blocked list", error: err.message });
  }
});

// Check if user is blocked
router.get("/:userId/is-blocked/:blockedUserId", async (req, res) => {
  try {
    const { userId, blockedUserId } = req.params;

    const block = await Block.findOne({ userId, blockedUserId });

    res.json({ isBlocked: !!block });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking block status", error: err.message });
  }
});

// Get all blocks for a user (both blocking and blocked by)
router.get("/:userId/blocks", async (req, res) => {
  try {
    const { userId } = req.params;

    // Users that this user has blocked
    const blocking = await Block.find({ userId })
      .populate("blockedUserId", "name avatar")
      .select("blockedUserId blockedAt");

    // Users that have blocked this user
    const blockedBy = await Block.find({ blockedUserId: userId })
      .populate("userId", "name avatar")
      .select("userId blockedAt");

    res.json({
      blocking: blocking.map(b => ({ ...b.toObject(), type: "blocking" })),
      blockedBy: blockedBy.map(b => ({ ...b.toObject(), type: "blocked_by" }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching blocks", error: err.message });
  }
});

module.exports = router;
