const express = require("express");
const Report = require("../models/reportModel");
const Post = require("../models/postModal");
const User = require("../models/userModel");

const router = express.Router();

// Create a report
router.post("/", async (req, res) => {
  try {
    const { reporterId, postId, userId, reason, description } = req.body;

    // Validate that either postId or userId is provided
    if (!postId && !userId) {
      return res.status(400).json({ message: "Either postId or userId is required" });
    }

    // Prevent self-reports
    if (userId && reporterId === userId) {
      return res.status(400).json({ message: "Cannot report yourself" });
    }

    // Check if reporter exists
    const reporter = await User.findById(reporterId);
    if (!reporter) {
      return res.status(404).json({ message: "Reporter not found" });
    }

    // If reporting a post, verify it exists
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
    }

    // If reporting a user, verify they exist
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Check if already reported (prevent duplicates)
    const existingReport = await Report.findOne({
      reporterId,
      postId: postId || null,
      userId: userId || null,
      status: { $ne: "dismissed" }
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this" });
    }

    // Create report
    const report = await Report.create({
      reporterId,
      postId: postId || null,
      userId: userId || null,
      reason,
      description
    });

    res.json({ message: "Report submitted successfully", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating report", error: err.message });
  }
});

// Get all reports (admin only)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate("reporterId", "name")
      .populate("postId", "text")
      .populate("userId", "name")
      .sort({ reportedAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
});

// Get user's reports
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ reporterId: userId })
      .populate("postId", "text")
      .populate("userId", "name")
      .sort({ reportedAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user reports", error: err.message });
  }
});

// Get reports for a specific post
router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const reports = await Report.find({ postId, status: { $ne: "dismissed" } })
      .populate("reporterId", "name")
      .sort({ reportedAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching post reports", error: err.message });
  }
});

// Get reports for a specific user
router.get("/reported-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ userId, status: { $ne: "dismissed" } })
      .populate("reporterId", "name")
      .sort({ reportedAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user reports", error: err.message });
  }
});

// Update report status (admin only)
router.patch("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, reviewNotes, reviewedBy } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewNotes,
        reviewedBy,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report updated", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating report", error: err.message });
  }
});

// Delete report (admin only)
router.delete("/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting report", error: err.message });
  }
});

module.exports = router;
