const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const {
  validatePhone,
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  getPasswordStrength
} = require("../utils/validation");
const {
  createOTP,
  verifyOTP,
  requestPasswordResetOTP
} = require("../services/otpService");
const {
  trackLoginAttempt,
  resetLoginAttempts,
  trackOTPRequest
} = require("../middleware/rateLimiter");

const router = express.Router();

// Country list (for signup)
const countries = [
  { "name": "India", "code": "IN", "phoneCode": "+91", "flag": "🇮🇳", "format": "(xxxxx xxxxx)" },
  { "name": "United States", "code": "US", "phoneCode": "+1", "flag": "🇺🇸", "format": "(xxx) xxx-xxxx" },
  { "name": "United Kingdom", "code": "GB", "phoneCode": "+44", "flag": "🇬🇧", "format": "+44 xxxx xxxxxx" },
  { "name": "Canada", "code": "CA", "phoneCode": "+1", "flag": "🇨🇦", "format": "(xxx) xxx-xxxx" },
  { "name": "Australia", "code": "AU", "phoneCode": "+61", "flag": "🇦🇺", "format": "+61 x xxxx xxxx" },
  { "name": "Germany", "code": "DE", "phoneCode": "+49", "flag": "🇩🇪", "format": "+49 xxx xxxxxxxx" },
  { "name": "France", "code": "FR", "phoneCode": "+33", "flag": "🇫🇷", "format": "+33 x xx xx xx xx" },
  { "name": "Italy", "code": "IT", "phoneCode": "+39", "flag": "🇮🇹", "format": "+39 xxx xxx xxxx" },
  { "name": "Spain", "code": "ES", "phoneCode": "+34", "flag": "🇪🇸", "format": "+34 xxx xx xx xx" },
  { "name": "Brazil", "code": "BR", "phoneCode": "+55", "flag": "🇧🇷", "format": "+55 xx xxxxx xxxx" }
];

// GET /api/auth/countries - Get list of countries with phone codes
router.get("/countries", (req, res) => {
  try {
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/test-otp/:phoneOrEmail - Get last OTP for testing (DEVELOPMENT ONLY)
router.get("/test-otp/:phoneOrEmail", async (req, res) => {
  try {
    const { phoneOrEmail } = req.params;
    
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    const isEmail = phoneOrEmail.includes("@");
    const otpRecord = await OTP.findOne({
      [isEmail ? "email" : "phone"]: phoneOrEmail
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found for this phone/email" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.json({
      message: "⚠️ DEVELOPMENT MODE - OTP for testing",
      phoneOrEmail,
      expiresAt: otpRecord.expiresAt,
      note: "Check backend console for OTP code during signup"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-phone - Check if phone exists
router.post("/check-phone", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Invalid phone format" });
    }

    const user = await User.findOne({ phone });

    res.json({
      available: !user,
      message: user ? "Phone already registered" : "Phone available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-email - Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    res.json({
      available: !user,
      message: user ? "Email already registered" : "Email available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-username - Check if username exists
router.post("/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters, letters/numbers/underscores/hyphens only"
      });
    }

    const user = await User.findOne({ username });

    res.json({
      available: !user,
      message: user ? "Username taken" : "Username available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/send-otp - Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneOrEmail, type = "signup" } = req.body;

    if (!phoneOrEmail) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    // Check rate limit
    const rateLimitCheck = trackOTPRequest(phoneOrEmail);
    if (rateLimitCheck.limited) {
      return res.status(429).json({ message: rateLimitCheck.message });
    }

    // Validate format
    const isEmail = phoneOrEmail.includes("@");
    if (isEmail && !validateEmail(phoneOrEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!isEmail && !validatePhone(phoneOrEmail)) {
      return res.status(400).json({ message: "Invalid phone format" });
    }

    const result = await createOTP(phoneOrEmail, type);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp - Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phoneOrEmail, otp, type = "signup" } = req.body;

    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ message: "Phone/Email and OTP required" });
    }

    const result = await verifyOTP(phoneOrEmail, otp, type);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/signup - Create account
router.post("/signup", async (req, res) => {
  try {
    const { phone, email, password, name, username, bio, country } = req.body;

    // Validation
    if (!phone && !email) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    const phoneOrEmail = phone || email;
    const isEmail = phoneOrEmail.includes("@");

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, special char"
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters, letters/numbers/underscores/hyphens only"
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be 2-50 characters, letters and spaces only"
      });
    }

    // Check if OTP is verified
    const otpRecord = await OTP.findOne({
      [isEmail ? "email" : "phone"]: phoneOrEmail,
      type: "signup",
      verified: true
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }, { username }]
    });

    if (existingUser) {
      if (existingUser.phone === phone) {
        return res.status(400).json({ message: "Phone already registered" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      phone,
      email,
      username,
      password: hashedPassword,
      name,
      bio: bio || "",
      country,
      phoneVerified: true,
      emailVerified: isEmail,
      verifiedAt: new Date()
    });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        country: user.country
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login - Login
router.post("/login", async (req, res) => {
  try {
    const { phoneOrEmail, password, rememberMe } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ message: "Phone/Email and password required" });
    }

    // Check rate limit
    const rateLimitCheck = trackLoginAttempt(phoneOrEmail);
    if (rateLimitCheck.locked) {
      return res.status(429).json({
        message: `Too many login attempts. Try again in ${rateLimitCheck.remainingMinutes} minutes.`
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts
    resetLoginAttempts(phoneOrEmail);

    // Create JWT token
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        country: user.country
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { phoneOrEmail } = req.body;

    if (!phoneOrEmail) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    const user = await User.findOne({
      $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await requestPasswordResetOTP(phoneOrEmail);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password - Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { phoneOrEmail, otp, newPassword, confirmPassword } = req.body;

    if (!phoneOrEmail || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, special char"
      });
    }

    // Verify reset OTP
    const isEmail = phoneOrEmail.includes("@");
    const otpRecord = await OTP.findOne({
      [isEmail ? "email" : "phone"]: phoneOrEmail,
      type: "reset"
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Max attempts reached" });
    }

    // Verify OTP
    const otpService = require("../services/otpService");
    if (!otpService.compareOTP(otp, otpRecord.otp)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user password
    const user = await User.findOne({
      $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/verify-token - Verify JWT token
router.get("/verify-token", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

module.exports = router;
