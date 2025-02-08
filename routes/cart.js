const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth.js");
const router = express.Router();
const User = require("../models/user.js");

// Fetch the products in the cart with delivery options
router.get("/get-cart", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    // Sample delivery options
    const deliveryOptions = [
      { id: "1", deliveryDays: 3, priceCents: 5000 },
      { id: "2", deliveryDays: 7, priceCents: 2000 },
      { id: "3", deliveryDays: 10, priceCents: 0 },
    ];

    res.status(200).json({ cart: user.cart, deliveryOptions });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add product to the user's cart
router.post("/add-to-cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid or missing product ID." });
  }

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Increment quantity if item exists
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add as new item otherwise
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res
      .status(200)
      .json({ message: "Product added to cart.", cart: user.cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update product quantity in the cart
router.put("/update-cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product ID or quantity." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    // Update quantity
    cartItem.quantity = quantity;

    await user.save();
    res
      .status(200)
      .json({ message: "Cart updated successfully.", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Remove product from the cart
router.delete(
  "/remove-from-cart/:productId",
  authMiddleware,
  async (req, res) => {
    const { productId } = req.params;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.userId },
        { $pull: { cart: { productId } } }, // Remove the product from the cart array
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        message: "Product removed from cart.",
        cart: updatedUser.cart,
      });
    } catch (error) {
      console.error("Error removing product from cart:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

module.exports = router;
