const express = require("express");
const Post = require("../models/postModal");
const User = require("../models/userModel");
const Hashtag = require("../models/hashtagModel");
const router = express.Router();


// Unified search endpoint: /api/search?q=...
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ posts: [], users: [], hashtags: [] });

    // Posts
    const posts = await Post.find({
      $or: [
        { text: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Users
    const users = await User.find({
      name: { $regex: q, $options: "i" },
    })
      .select("_id name avatar bio")
      .limit(20)
      .lean();

    // Hashtags
    const hashtags = await Hashtag.find({
      tag: { $regex: q.replace(/^#/, ""), $options: "i" },
    })
      .sort({ postCount: -1 })
      .limit(20)
      .lean();

    res.json({
      posts,
      users,
      hashtags: hashtags.map(h => h.tag),
    });
  } catch (err) {
    res.status(500).json({ posts: [], users: [], hashtags: [], error: err.message });
  }
});


// Search posts by keyword
router.get("/posts/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const posts = await Post.find({
      $or: [
        { text: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ],
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search users by name
router.get("/users/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      name: { $regex: q, $options: "i" },
    })
      .select("name avatar farmName bio")
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search hashtags
router.get("/hashtags/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const hashtags = await Hashtag.find({
      tag: { $regex: q, $options: "i" },
    })
      .sort({ postCount: -1 })
      .limit(20);

    res.json(hashtags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get posts by hashtag
router.get("/hashtag/:tag", async (req, res) => {
  try {
    const { tag } = req.params;
    const posts = await Post.find({
      text: { $regex: `#${tag}`, $options: "i" },
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending hashtags
router.get("/trending", async (req, res) => {
  try {
    const trending = await Hashtag.find({ trending: true })
      .sort({ postCount: -1 })
      .limit(10);

    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
