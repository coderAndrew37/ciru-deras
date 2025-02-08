import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Product from "../models/Product.js";

dotenv.config();
const router = express.Router();

// AI Prompt for Product Descriptions
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

router.post("/:productId/generate-description", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: DESCRIPTION_PROMPT },
          {
            role: "user",
            content: `Generate a description for ${product.name} made of ${product.material}.`,
          },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

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

export default router;
