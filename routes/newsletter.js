const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer"); // Include Nodemailer
const {
  NewsletterEmail,
  validateNewsletterEmail,
} = require("../models/newsletter.js");

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email provider
  auth: {
    user: process.env.EMAIL_USER, // Set your email address in .env
    pass: process.env.EMAIL_PASSWORD, // Set your email password in .env
  },
});

// POST route for newsletter subscription
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  const { error } = validateNewsletterEmail(email);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingSubscriber = await NewsletterEmail.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "You're already subscribed!" });
    }

    const newSubscriber = new NewsletterEmail({ email });
    await newSubscriber.save();

    // Admin Notification Email
    await transporter.sendMail({
      from: `"Interiors by Tiffi Ltd" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Newsletter Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">📩 New Subscriber Alert</h2>
          <p style="font-size: 16px; color: #555555; margin-bottom: 10px;">
            You have a new subscriber to your newsletter:
          </p>
          <p style="font-size: 16px; color: #333333; font-weight: bold;">
            Email: <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 14px; color: #777777; text-align: center; margin-top: 20px;">
            <strong>Interiors by Tiffi Ltd</strong><br />
            <a href="#" style="color: #007bff; text-decoration: none;">Visit Dashboard</a>
          </p>
        </div>
      `,
    });

    // Subscriber Confirmation Email
    await transporter.sendMail({
      from: `"Interiors by Tiffi Ltd" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Subscribing!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">🎉 Welcome to Interiors by Tiffi Ltd!</h2>
          <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">
            Thank you for subscribing to our newsletter. We're excited to share the latest interior design tips, trends, and updates with you!
          </p>
          <p style="font-size: 16px; color: #555555;">
            Stay tuned for inspiration and expert advice to help you transform your spaces.
          </p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 14px; color: #777777;">
            Best regards,<br />
            <strong>Interiors by Tiffi Ltd</strong>
          </p>
          <p style="font-size: 14px; color: #007bff; text-align: center; margin-top: 20px;">
            <a href="https://example.com" style="color: #007bff; text-decoration: none;">Visit Our Website</a>
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "Thank you for subscribing!" });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "Failed to subscribe. Please try again." });
  }
});

module.exports = router;
