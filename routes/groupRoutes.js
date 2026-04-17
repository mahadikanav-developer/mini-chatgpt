const express = require("express");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

const router = express.Router();

// Create group
router.post("/", async (req, res) => {
  try {
    const { name, description, category, creator, isPrivate } = req.body;

    const group = await Group.create({
      name,
      description,
      category,
      creator,
      isPrivate,
      members: [creator],
      admins: [creator]
    });

    res.json({ message: "Group created", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating group", error: err.message });
  }
});

// Get all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("creator", "name")
      .populate("members", "name")
      .sort({ memberCount: -1 });

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching groups", error: err.message });
  }
});

// Get single group
router.get("/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("creator", "name")
      .populate("members", "name")
      .populate("admins", "name")
      .populate("posts");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching group", error: err.message });
  }
});

// Join group
router.post("/:groupId/join", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      group.memberCount = group.members.length;
      await group.save();
    }

    res.json({ message: "Joined group", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error joining group", error: err.message });
  }
});

// Leave group
router.post("/:groupId/leave", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(m => m.toString() !== userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ message: "Left group", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error leaving group", error: err.message });
  }
});

// Add post to group
router.post("/:groupId/post", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { postId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $push: { posts: postId } },
      { new: true }
    );

    res.json({ message: "Post added to group", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding post", error: err.message });
  }
});

// Update group
router.put("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, category } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { name, description, category },
      { new: true }
    );

    res.json({ message: "Group updated", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating group", error: err.message });
  }
});

module.exports = router;
