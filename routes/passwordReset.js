const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // Placeholder for email service
const User = require("../models/user.js");
const router = express.Router();
const bcrypt = require("bcrypt");

// Configure email transporter (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Password reset request
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate password reset token and expiry
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email with reset link
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password.html?token=${resetToken}`;
    const message = `To reset your password, click this link: ${resetUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

// Password reset confirmation
router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token has expired
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    // Validate and hash the new password before saving
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    user.password = await bcrypt.hash(password, 10); // Hash new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in reset-password route:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

// Email verification route
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) return res.status(400).json({ message: "Verification failed" });

    user.verificationToken = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error in verify-email route:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

module.exports = router;
