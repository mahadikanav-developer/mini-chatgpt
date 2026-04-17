const express = require("express");
const Page = require("../models/pageModel");
const User = require("../models/userModel");

const router = express.Router();

// Create page
router.post("/", async (req, res) => {
  try {
    const { name, description, category, creator, website, email, phone, address, buttonAction, buttonLink } = req.body;

    const page = await Page.create({
      name,
      description,
      category,
      creator,
      website,
      email,
      phone,
      address,
      buttonAction,
      buttonLink,
      admins: [creator],
      followers: [creator]
    });

    res.json({ message: "Page created", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating page", error: err.message });
  }
});

// Get all pages
router.get("/", async (req, res) => {
  try {
    const pages = await Page.find()
      .populate("creator", "name")
      .populate("admins", "name")
      .sort({ followerCount: -1 });

    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pages", error: err.message });
  }
});

// Get single page
router.get("/:pageId", async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId)
      .populate("creator", "name email")
      .populate("followers", "name")
      .populate("admins", "name");

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching page", error: err.message });
  }
});

// Follow page
router.post("/:pageId/follow", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { userId } = req.body;

    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (!page.followers.includes(userId)) {
      page.followers.push(userId);
      page.followerCount = page.followers.length;
      await page.save();
    }

    res.json({ message: "Page followed", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error following page", error: err.message });
  }
});

// Unfollow page
router.post("/:pageId/unfollow", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { userId } = req.body;

    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.followers = page.followers.filter(f => f.toString() !== userId);
    page.followerCount = page.followers.length;
    await page.save();

    res.json({ message: "Page unfollowed", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unfollowing page", error: err.message });
  }
});

// Add review
router.post("/:pageId/review", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { userId, rating, text } = req.body;

    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.reviews.push({
      userId,
      rating,
      text
    });

    await page.save();
    res.json({ message: "Review added", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
});

// Update page (admin only)
router.put("/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { name, description, website, email, phone, address, buttonAction, buttonLink } = req.body;

    const page = await Page.findByIdAndUpdate(
      pageId,
      { name, description, website, email, phone, address, buttonAction, buttonLink },
      { new: true }
    );

    res.json({ message: "Page updated", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating page", error: err.message });
  }
});

module.exports = router;
