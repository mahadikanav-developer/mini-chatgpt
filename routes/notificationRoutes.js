const express = require("express");
const Notification = require("../models/notificationModel");
const router = express.Router();

// Create notification - MUST BE BEFORE GET ROUTES
router.post("/", async (req, res) => {
  try {
    const { recipientId, senderId, type, postId, storyId, text } = req.body;

    // Validate required fields
    if (!recipientId || !senderId || !type) {
      return res.status(400).json({ message: "Missing required fields: recipientId, senderId, type" });
    }

    // Don't notify user about their own actions
    if (recipientId === senderId) {
      return res.json({ message: "Own action, no notification" });
    }

    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      postId: postId || null,
      storyId: storyId || null,
      text: text || "",
    });

    const populated = await notification
      .populate("senderId", "name avatar")
      .populate("postId");

    res.json(populated);
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get unread count - BEFORE /:userId to avoid ambiguity
router.get("/unread/:userId", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.params.userId,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put("/:notificationId/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications for user - MUST BE LAST
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.params.userId,
    })
      .populate("senderId", "name avatar")
      .populate("postId")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete("/:notificationId", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
