const express = require("express");
const Repost = require("../models/repostModel");
const Post = require("../models/postModal");
const Notification = require("../models/notificationModel");
const router = express.Router();

// Create a repost
router.post("/", async (req, res) => {
  try {
    const { originalPostId, userId, caption } = req.body;

    // Check if post already exists
    const post = await Post.findById(originalPostId);
    if (!post) return res.status(404).json("Post not found");

    // Create repost
    const newRepost = new Repost({
      originalPostId,
      userId,
      caption,
    });

    await newRepost.save();

    // Create notification for original post owner
    if (post.userId.toString() !== userId) {
      const user = await require("../models/userModel").findById(userId);
      await Notification.create({
        recipientId: post.userId,
        senderId: userId,
        type: "repost",
        postId: originalPostId,
        text: `${user?.name || "Someone"} reposted your post`,
      });
    }

    res.status(201).json(newRepost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all reposts of a post
router.get("/post/:postId", async (req, res) => {
  try {
    const reposts = await Repost.find({
      originalPostId: req.params.postId,
    })
      .populate("userId", "name avatar bio")
      .populate("originalPostId");

    res.json(reposts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get user's reposts
router.get("/user/:userId", async (req, res) => {
  try {
    const reposts = await Repost.find({ userId: req.params.userId })
      .populate("userId", "name avatar bio")
      .populate("originalPostId");

    res.json(reposts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like a repost
router.put("/:repostId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const repost = await Repost.findById(req.params.repostId);

    if (!repost) return res.status(404).json("Repost not found");

    const index = repost.likes.indexOf(userId);
    if (index === -1) {
      repost.likes.push(userId);
    } else {
      repost.likes.splice(index, 1);
    }

    await repost.save();
    res.json(repost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add comment to repost
router.post("/:repostId/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const repost = await Repost.findById(req.params.repostId);

    if (!repost) return res.status(404).json("Repost not found");

    repost.comments.push({
      userId,
      text,
    });

    await repost.save();
    res.json(repost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a repost
router.delete("/:repostId", async (req, res) => {
  try {
    const repost = await Repost.findById(req.params.repostId);

    if (!repost) return res.status(404).json("Repost not found");

    if (repost.userId.toString() !== req.body.userId) {
      return res.status(403).json("You can only delete your own reposts");
    }

    await Repost.findByIdAndDelete(req.params.repostId);
    res.json("Repost deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
