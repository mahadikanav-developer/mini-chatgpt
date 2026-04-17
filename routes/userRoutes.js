const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// USER RECOMMENDATIONS (User Discovery)
// GET /api/users/suggestions?userId=...
router.get("/suggestions", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Exclude self and already-followed users
    const excludeIds = [userId, ...currentUser.following.map(id => id.toString())];

    // Priority 1: Same region
    let suggestions = await User.find({
      _id: { $nin: excludeIds },
      region: currentUser.region,
    })
      .select("_id name username avatar region crops bio")
      .limit(10)
      .lean();

    // If not enough, add users with similar crops
    if (suggestions.length < 10 && currentUser.crops) {
      const cropList = currentUser.crops.split(",").map(c => c.trim().toLowerCase());
      const more = await User.find({
        _id: { $nin: [...excludeIds, ...suggestions.map(u => u._id.toString())] },
        crops: { $exists: true, $ne: "" },
      })
        .select("_id name username avatar region crops bio")
        .lean();
      // Simple crop overlap
      const cropSuggestions = more.filter(u =>
        u.crops && u.crops.split(",").some(c => cropList.includes(c.trim().toLowerCase()))
      );
      suggestions = suggestions.concat(cropSuggestions.slice(0, 10 - suggestions.length));
    }

    // If still not enough, fill with random users
    if (suggestions.length < 10) {
      const randoms = await User.find({
        _id: { $nin: [...excludeIds, ...suggestions.map(u => u._id.toString())] },
      })
        .select("_id name username avatar region crops bio")
        .limit(10 - suggestions.length)
        .lean();
      suggestions = suggestions.concat(randoms);
    }

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(400).json({ message: "Phone number already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Signup successful", token, user });
  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN ✅ fixed broken error handler
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, name: user.name, phone: user.phone, avatar: user.avatar },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login OK", token, user });
  } catch (err) {
    // ✅ was: err.response.data and alert() — both crash Node.js
    console.log("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER PROFILE
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// FOLLOW
router.post("/follow/:userId", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    
    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId required" });
    }

    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(currentUserId);
    
    if (!userToFollow) return res.status(404).json({ message: "User to follow not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });
    if (currentUserId === req.params.userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const isFollowing = currentUser.following?.some(id => id.toString() === req.params.userId);
    if (!isFollowing) {
      currentUser.following.push(req.params.userId);
      const hasFollower = userToFollow.followers?.some(id => id.toString() === currentUserId);
      if (!hasFollower) {
        userToFollow.followers.push(currentUserId);
      }
    }
    
    await currentUser.save();
    await userToFollow.save();
    res.json({ message: "Following", currentUser });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UNFOLLOW
router.post("/unfollow/:userId", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    
    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId required" });
    }

    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(currentUserId);
    
    if (!userToUnfollow) return res.status(404).json({ message: "User to unfollow not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });
    if (currentUserId === req.params.userId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    
    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed", currentUser });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE PROFILE ✅ added crops
router.put("/:userId", async (req, res) => {
  try {
    const { bio, farmName, region, farmSize, crops } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { bio, farmName, region, farmSize, crops },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY TOKEN
router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.body.token;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ valid: true, user });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Token expired or invalid" });
  }
});

module.exports = router;