const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const { Product } = require("../models/product");

dotenv.config();
const router = express.Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// ✅ AI System Prompt for Customer Support & FAQs
const SUPPORT_PROMPT = `
You are an AI assistant for Ciru Ciru wa Deras, a fashion brand specializing in Deras.
Your role:
- Answer customer questions about products, shipping, and returns.
- Recommend fashion items based on user preferences.
- Provide styling advice for different occasions.
- Offer promotions and discounts when relevant.
- If unsure, politely ask the user to contact support.

📌 Frequently Asked Questions:
1. 🚚 **Shipping**: Free shipping on orders over KSh 5000.
2. 🔄 **Returns**: 7-day return policy for unworn items in original packaging.
3. 💳 **Payment**: We accept M-Pesa, Credit Cards, and PayPal.
4. 📦 **Delivery Time**: Orders are delivered within 3-5 business days.
`;

// ✅ AI System Prompt for Product Recommendations
const SHOPPING_PROMPT = `
You are an AI shopping assistant for Ciru Ciru wa Deras.
Your job:
- Recommend products based on user preferences (color, fabric, occasion).
- Suggest trending and best-selling products.
- If unsure, politely ask follow-up questions.

Example interactions:
User: "I need a light deras for summer"
AI: "I recommend our Summer Cotton Deras. It's breathable and perfect for hot weather."
`;

// ✅ Fetch Top 10 Products from Database
async function fetchProducts() {
  try {
    const products = await Product.find().limit(10);
    return products
      .map((p) => `${p.name} - ${p.priceCents / 100} KSh`)
      .join("\n");
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return "No product data available.";
  }
}

// ✅ Function to Determine Which AI Prompt to Use
function getPrompt(userMessage) {
  const shoppingKeywords = [
    "recommend",
    "suggest",
    "best deras",
    "light deras",
    "for summer",
    "outfit for",
  ];
  const isShoppingQuery = shoppingKeywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  return isShoppingQuery ? SHOPPING_PROMPT : SUPPORT_PROMPT;
}

// ✅ Chatbot Route (Handles FAQs & Recommendations)
router.post("/", async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const selectedPrompt = getPrompt(userMessage); // ✅ Choose the right prompt
    const productList = await fetchProducts(); // ✅ Fetch products for recommendations

    const response = await axios.post(
      DEEPSEEK_ENDPOINT,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: selectedPrompt + "\n\nAvailable Products:\n" + productList,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ DeepSeek API Error:", error);
    res.status(500).json({ error: "DeepSeek API issue. Try again later." });
  }
});

module.exports = router;
