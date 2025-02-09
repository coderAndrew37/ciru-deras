const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const {
  NewsletterEmail,
  validateNewsletterEmail,
} = require("../models/newsletter.js");

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
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
      from: `"Ciru Ciru wa Deras" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "📩 New Newsletter Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">📩 New Subscriber Alert</h2>
          <p>You have a new subscriber to your newsletter:</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center;"><strong>Ciru Ciru wa Deras</strong><br /><a href="#" style="color: #007bff; text-decoration: none;">Visit Dashboard</a></p>
        </div>
      `,
    });

    // Subscriber Confirmation Email
    await transporter.sendMail({
      from: `"Ciru Deras" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Subscribing!",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">🎉 Welcome to Ciru Deras!</h2>
      <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">
        Thank you for subscribing to our newsletter! You’ll be the first to know about new arrivals, exclusive offers, and updates.
      </p>
      <p style="font-size: 16px; color: #555555;">
        If you ever wish to unsubscribe, you can do so at any time by clicking the link below:
      </p>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${
          process.env.BASE_URL
        }/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" 
           style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Unsubscribe
        </a>
      </p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 14px; color: #777777; text-align: center;">
        <strong>Ciru Deras</strong><br />
        <a href="https://example.com" style="color: #007bff; text-decoration: none;">Visit Our Website</a>
      </p>
    </div>
  `,
    });

    res.status(200).json({ message: "✅ Subscription successful!" });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "❌ Subscription failed. Try again." });
  }
});

// Unsubscribe Route (Handles GET request from email link)
router.get("/unsubscribe", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Invalid request. No email provided.");
  }

  try {
    const subscriber = await NewsletterEmail.findOneAndDelete({ email });

    if (!subscriber) {
      return res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px;">
          <h2 style="color: #dc3545;">Unsubscribe Failed</h2>
          <p>The email <strong>${email}</strong> was not found in our subscription list.</p>
          <a href="/" style="color: #007bff; text-decoration: none;">Return to Homepage</a>
        </div>
      `);
    }

    res.send(`
      <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px;">
        <h2 style="color: #28a745;">Unsubscribed Successfully</h2>
        <p>You have been removed from our mailing list.</p>
        <a href="/" style="color: #007bff; text-decoration: none;">Return to Homepage</a>
      </div>
    `);
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

module.exports = router;
