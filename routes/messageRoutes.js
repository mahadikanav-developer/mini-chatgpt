const express = require("express");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const router = express.Router();

// Get all conversations for current user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name _id avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create a conversation with another user
router.post("/:userId", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    const otherUserId = req.params.userId;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    }).populate("participants", "name _id avatar");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
      });
      conversation = await conversation.populate(
        "participants",
        "name _id avatar"
      );
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages in a conversation
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post("/:conversationId/message", async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const message = await Message.create({
      conversationId: req.params.conversationId,
      senderId,
      text,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: {
        senderId,
        text,
        timestamp: new Date(),
      },
    });

    const populatedMessage = await message.populate("senderId", "name avatar");
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete("/:conversationId/message/:messageId", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
