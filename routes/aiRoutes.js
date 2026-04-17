const express = require("express");
const router = express.Router();
const axios = require("axios");
const Post = require("../models/postModal");

// Helper: clean input
const normalize = (text) => text.toLowerCase().trim();

// AI / Search endpoint
router.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  const cleanMessage = normalize(message);

  try {
    // 🔥 1. SMART SEARCH (better matching)
    const keywords = cleanMessage.split(" ");

    const posts = await Post.find({
      $or: keywords.map(word => ({
        text: { $regex: word, $options: "i" }
      }))
    }).limit(5);

    if (posts.length > 0) {
      return res.json({
        source: "community",
        reply:
          "👨‍🌾 Farmers say:\n\n" +
          posts.map((p, i) => `${i + 1}. ${p.text}`).join("\n")
      });
    }

    // 🤖 2. AI FALLBACK
    const aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://127.0.0.1:5001/chat";

    const aiRes = await axios.post(
      aiServiceUrl,
      { message: cleanMessage },
      { timeout: 5000 }
    );

    return res.json({
      source: "ai",
      reply: aiRes.data.reply || "No response from AI"
    });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err.message);

    // ⚠️ FINAL FALLBACK (VERY IMPORTANT)
    return res.json({
      source: "fallback",
      reply:
        "⚠️ I couldn’t find a strong answer. Try adding crop name + problem (e.g., 'tomato yellow leaves')."
    });
  }
});

module.exports = router;