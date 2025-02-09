const express = require("express");
const { Product, validateProduct } = require("../models/product");
const router = express.Router();
const mongoose = require("mongoose");

// Fetch products with pagination and filtering by category
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const category = req.query.category; // Optional category filter

  try {
    // Build the filter object
    const filter = {};
    if (category) filter.category = category;

    // Count total products matching the filter
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Retrieve products with pagination and filtering
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Fetch products by IDs
router.get("/by-ids", async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",") : [];

  if (ids.length === 0) {
    return res.status(400).json({ error: "No IDs provided" });
  }

  try {
    const validObjectIds = ids.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const products = await Product.find({ _id: { $in: validObjectIds } });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST route to create a product
router.post("/", async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// Search products by name, keywords, category, or size
router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  const category = req.query.category;
  const size = req.query.size;
  const color = req.query.color;
  const sort = req.query.sort;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;

  // Build filter conditions
  const filter = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { keywords: { $regex: query, $options: "i" } },
    ],
  };

  if (category) filter.category = category;
  if (size) filter.sizes = size;
  if (color) filter["colors.name"] = color;

  try {
    // Apply sorting (price, rating)
    const sortOption =
      sort === "price-asc"
        ? { priceCents: 1 }
        : sort === "price-desc"
        ? { priceCents: -1 }
        : sort === "rating"
        ? { "rating.stars": -1 }
        : {};

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name image rating priceCents colors sizes");

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({ products, currentPage: page, totalPages, totalProducts });
  } catch (error) {
    console.error("❌ Error during search:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update stock for a specific color
router.patch("/:id/update-color-stock", async (req, res) => {
  const { id } = req.params;
  const { colorName, newStock } = req.body;

  if (!colorName || newStock == null) {
    return res
      .status(400)
      .json({ error: "colorName and newStock are required" });
  }

  try {
    // Find the product
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Update the stock for the specified color
    const color = product.colors.find((c) => c.name === colorName);
    if (!color) return res.status(404).json({ error: "Color not found" });

    color.stock = newStock;
    await product.save();

    res.json({ message: "Stock updated successfully", product });
  } catch (error) {
    console.error("Error updating color stock:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// Suggestions endpoint for typeahead
router.get("/suggestions", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { keywords: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("name");

    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

module.exports = router;
