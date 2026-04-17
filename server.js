const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

function loadEnvFromFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const messageRoutes = require("./routes/messageRoutes");
const storyRoutes = require("./routes/storyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const savedPostRoutes = require("./routes/savedPostRoutes");
const searchRoutes = require("./routes/searchRoutes");
const repostRoutes = require("./routes/repostRoutes");
const blockRoutes = require("./routes/blockRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const streamRoutes = require("./routes/streamRoutes");
const communityRoutes = require("./routes/communityRoutes");
const groupRoutes = require("./routes/groupRoutes");
const eventRoutes = require("./routes/eventRoutes");
const pageRoutes = require("./routes/pageRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const reelRoutes = require("./routes/reelRoutes");
const igtvRoutes = require("./routes/igtvRoutes");

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Middleware
app.use(express.json());

// Static images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/saved", savedPostRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reposts", repostRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/igtv", igtvRoutes);

// MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmAI";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));