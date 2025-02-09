const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const Product = require("../models/Product");

dotenv.config();
const router = express.Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// ✅ AI Prompt for Product Descriptions
const DESCRIPTION_PROMPT = `
You are an AI product description writer for Ciru Ciru wa Deras.
Your job:
- Generate creative and engaging product descriptions.
- Highlight fabric, design, and best use cases.
- Use a friendly and persuasive tone.

Example:
Product: Elegant Silk Deras
Description: "Experience luxury with our Elegant Silk Deras, designed for a timeless look. Made from premium silk, it's lightweight and perfect for special occasions."
`;

// ✅ Generate AI-Powered Product Descriptions
router.post("/:productId/generate-description", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const response = await axios.post(
      DEEPSEEK_ENDPOINT,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: DESCRIPTION_PROMPT },
          {
            role: "user",
            content: `Generate a description for the ${product.name} made of ${product.material}, perfect for ${product.category}.`,
          },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Save AI-generated description to MongoDB
    product.description = response.data.choices[0].message.content;
    await product.save();

    res.json({
      message: "✅ AI Description Generated",
      description: product.description,
    });
  } catch (error) {
    console.error("❌ DeepSeek API Error:", error);
    res.status(500).json({ error: "DeepSeek API issue. Try again later." });
  }
});

module.exports = router;
