const express = require("express");
const mongoose = require("mongoose");
const Community = require("../models/communityModel");

const router = express.Router();

const toResponse = (community, userId) => {
  const joined =
    Boolean(userId) &&
    community.memberIds.some((memberId) => memberId.toString() === userId);

  return {
    _id: community._id,
    id: community._id.toString(),
    name: community.name,
    category: community.category,
    location: community.location,
    description: community.description,
    members: community.memberIds.length,
    joined,
    createdBy: community.createdBy,
    createdAt: community.createdAt,
  };
};

// GET /api/communities
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const communities = await Community.find({}).sort({ createdAt: -1 });
    res.json(communities.map((community) => toResponse(community, userId)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching communities" });
  }
});

// POST /api/communities
router.post("/", async (req, res) => {
  try {
    const { name, category, location, description, userId } = req.body;

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const canAttachCreator = userId && mongoose.Types.ObjectId.isValid(userId);
    const memberIds = canAttachCreator ? [userId] : [];

    const community = await Community.create({
      name: name.trim(),
      category: category?.trim() || "Farming",
      location: location?.trim() || "Online",
      description: description.trim(),
      createdBy: canAttachCreator ? userId : null,
      memberIds,
    });

    res.status(201).json(toResponse(community, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating community" });
  }
});

// POST /api/communities/:groupId/membership
router.post("/:groupId/membership", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    const community = await Community.findById(groupId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const hasMember = community.memberIds.some((id) => id.toString() === userId);
    if (hasMember) {
      community.memberIds = community.memberIds.filter((id) => id.toString() !== userId);
    } else {
      community.memberIds.push(userId);
    }

    await community.save();

    res.json({
      message: hasMember ? "Left community" : "Joined community",
      members: community.memberIds.length,
      joined: !hasMember,
      community: toResponse(community, userId),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating membership" });
  }
});

module.exports = router;
