const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Configure rate limiter for daily limit
const dailyLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 requests per day
  message: "You have reached the daily submission limit. Try again tomorrow.",
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact form route
router.post("/", dailyLimit, async (req, res) => {
  const { name, email, message } = req.body;
  console.log("Incoming request:", req.body);

  // Validate input data
  if (!name || !email || !message) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  try {
    // Email styles
    const emailStyles = `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      h1 {
        color: #007bff;
      }
      p {
        margin: 0.5em 0;
      }
      blockquote {
        margin: 1em 0;
        padding: 1em;
        background-color: #f9f9f9;
        border-left: 5px solid #007bff;
      }
      footer {
        margin-top: 2em;
        font-size: 0.9em;
        color: #555;
      }
    `;

    // Send email notification to admin
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <html>
          <head>
            <style>${emailStyles}</style>
          </head>
          <body>
            <h1>New Contact Form Submission</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <blockquote>${message}</blockquote>
          </body>
        </html>
      `,
    });

    // Send acknowledgment email to user
    await transporter.sendMail({
      from: `"Dev Andrew" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting us",
      html: `
        <html>
          <head>
            <style>${emailStyles}</style>
          </head>
          <body>
            <h1>Thank you, ${name}!</h1>
            <p>We received your message and will get back to you shortly.</p>
            <p>Here's a copy of your message:</p>
            <blockquote>${message}</blockquote>
            <footer>
              <p>Best Regards,</p>
              <p>Dev Andrew</p>
            </footer>
          </body>
        </html>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

module.exports = router;
