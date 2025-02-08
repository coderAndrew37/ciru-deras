import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const router = express.Router();

// DeepSeek API Setup
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// AI Chatbot System Prompt
const SYSTEM_PROMPT = `
You are an AI assistant for Ciru Ciru wa Deras, a fashion brand specializing in Deras.
Your job:
- Answer customer questions about products, shipping, and returns.
- Recommend fashion items based on user preferences.
- Provide styling advice for different occasions.
- Offer promotions and discounts when relevant.
- If you don’t know something, politely ask the user to contact support.

Frequently Asked Questions:
1. 🚚 **Shipping**: Free shipping on orders over KSh 5000.
2. 🔄 **Returns**: 7-day return policy for unworn items in original packaging.
3. 💳 **Payment**: We accept M-Pesa, Credit Cards, and PayPal.
4. 📦 **Delivery Time**: Orders are delivered within 3-5 business days.

`;

// AI System Prompt for Shopping Assistant
const SHOPPING_PROMPT = `
You are an AI shopping assistant for Ciru Ciru wa Deras.
Your role:
- Recommend products based on user preferences (color, fabric, occasion).
- Suggest trending and best-selling products.
- If unsure, politely ask follow-up questions.

Example interactions:
User: "I need a light deras for summer"
AI: "I recommend our Summer Cotton Deras. It's breathable and perfect for hot weather."
`;

async function fetchProducts() {
  const products = await Product.find().limit(10);
  return products.map((p) => `${p.name} - ${p.price} KSh`).join("\n");
}
router.post("/", async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const productList = await fetchProducts();

    const response = await axios.post(
      DEEPSEEK_ENDPOINT,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              SHOPPING_PROMPT + "\n\nAvailable Products:\n" + productList,
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

    const botReply = response.data.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error("❌ DeepSeek API Error:", error);
    res.status(500).json({ error: "DeepSeek API issue. Try again later." });
  }
});

export default router;
