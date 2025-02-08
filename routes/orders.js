const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth.js");
const adminMiddleware = require("../middleware/isAdmin.js");
const { Order, validateOrder } = require("../models/order.js");
const { Product } = require("../models/product.js"); // Use destructuring here
const { sendOrderConfirmationEmail } = require("../services/emailService.js");

console.log("Product model:", Product); // This should now display the model object in the console
const router = express.Router();

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { items, name, email, phone, address, paymentMethod } = req.body;

  // Validate order data
  const { error } = validateOrder({
    userId,
    items,
    totalCents: req.body.totalCents,
    name,
    email,
    phone,
    address,
    paymentMethod,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    let totalCents = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const itemTotal = product.priceCents * item.quantity;
      totalCents += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        priceCents: product.priceCents,
      });
    }

    // Create the order
    const order = new Order({
      userId,
      items: orderItems,
      totalCents,
      name,
      email,
      phone,
      address,
      paymentMethod,
      status: "Preparing", // Default status
    });

    await order.save();

    // Send confirmation email
    await sendOrderConfirmationEmail(email, order);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await Order.find({ userId }).populate(
      "items.productId",
      "name image priceCents"
    );
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid Order ID" });
  }

  try {
    const order = await Order.findById(orderId).populate(
      "items.productId",
      "name image priceCents"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Simulate order status and delivery date if missing
    const enrichedOrder = {
      ...order.toObject(),
      status: order.status || "Preparing", // Default status
      items: order.items.map((item) => ({
        ...item.toObject(),
        deliveryDate:
          item.deliveryDate ||
          new Date(order.datePlaced.getTime() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days after placement
      })),
    };

    res.status(200).json(enrichedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Admin route to fetch all orders
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  console.log("Route /admin accessed."); // Debug log for route entry
  try {
    const orders = await Order.find()
      .populate("items.productId", "name image priceCents")
      .sort({ datePlaced: -1 });

    console.log("Orders fetched:", orders); // Debug log for fetched orders
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders for admin:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put(
  "/admin/:orderId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { status } = req.body;

    if (!["Preparing", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      order.status = status;
      await order.save();

      res.status(200).json({ message: "Order status updated successfully." });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

module.exports = router;
