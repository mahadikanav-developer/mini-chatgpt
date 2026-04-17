const express = require("express");
const Hashtag = require("../models/hashtagModel");
const Post = require("../models/postModal");

const router = express.Router();

// GET trending hashtags (top 10 by postCount, updated recently)
router.get("/trending", async (req, res) => {
  try {
    const trending = await Hashtag.find()
      .sort({ postCount: -1, updatedAt: -1 })
      .limit(10)
      .lean();
    res.json(trending.map(h => h.tag));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET posts for a hashtag
router.get("/:tag", async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase();
    const posts = await Post.find({ content: { $regex: `#${tag}(\s|$)`, $options: "i" } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
