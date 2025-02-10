const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/isAdmin");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// Rate Limit: Prevent brute-force login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per IP
  message: "Too many login attempts. Please try again later.",
});

// JWT Secret Keys
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

// 🔹 Generate Access Token (Expires in 45m)
function generateAccessToken(user) {
  return jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, jwtSecret, {
    expiresIn: "45m",
  });
}

// 🔹 Generate Refresh Token (Expires in 7 days)
function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, jwtRefreshSecret, { expiresIn: "7d" });
}

// 🔹 Set Authentication Cookies
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 45 * 60 * 1000, // 45 minutes
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// ✅ **REGISTER USER**
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ **LOGIN USER**
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: "Login successful",
      name: user.name,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ **GET USER PROFILE**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email isAdmin"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ **CHECK IF USER IS AUTHENTICATED**
router.get("/is-authenticated", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name isAdmin"); // FIXED
    res
      .status(200)
      .json({ authenticated: true, name: user.name, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// ✅ **REFRESH TOKEN**
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const newAccessToken = generateAccessToken({ _id: decoded.userId });

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 45 * 60 * 1000, // 45 minutes
    });

    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
});

// ✅ **LOGOUT USER**
router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(200).json({ message: "Logged out successfully" });
});

// ✅ **CREATE ADMIN USER (Protected)**
router.post(
  "/create-admin",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      if (await User.findOne({ email }))
        return res.status(400).json({ message: "Email already exists" });

      const admin = new User({ name, email, password, isAdmin: true });
      await admin.save();

      res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
