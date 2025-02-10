require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
const { Product } = require("./models/product"); // Import the Product model

// MongoDB connection URI
const dbURI = process.env.MONGODB_URI; // Replace with your DB URI

// Sample Deras products
const products = [
  {
    image: "/images/products/dera1.jpg",
    name: "Elegant Dera",
    description:
      "A stylish and comfortable traditional Dera for all occasions.",
    category: "Deras",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Red", image: "/images/products/dera_red.jpg", stock: 50 },
      { name: "Blue", image: "/images/products/dera_blue.jpg", stock: 30 },
    ],
    rating: { stars: 4.7, count: 95 },
    stock: 80,
    priceCents: 49900,
    salePriceCents: 39900,
    keywords: ["dera", "traditional", "elegant"],
  },
  {
    image: "/images/products/dera2.jpg",
    name: "Casual Dera",
    description: "A lightweight Dera perfect for casual wear.",
    category: "Deras",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Green", image: "/images/products/dera_green.jpg", stock: 40 },
      { name: "Yellow", image: "/images/products/dera_yellow.jpg", stock: 25 },
    ],
    rating: { stars: 4.5, count: 78 },
    stock: 65,
    priceCents: 44900,
    salePriceCents: 37900,
    keywords: ["dera", "casual", "lightweight"],
  },
  {
    image: "/images/products/dera3.jpg",
    name: "Classic Dera",
    description: "A timeless Dera design suitable for any event.",
    category: "Deras",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", image: "/images/products/dera_black.jpg", stock: 20 },
      { name: "White", image: "/images/products/dera_white.jpg", stock: 15 },
    ],
    rating: { stars: 4.9, count: 110 },
    stock: 35,
    priceCents: 52900,
    salePriceCents: 46900,
    keywords: ["dera", "classic", "timeless"],
  },
  {
    image: "/images/products/dera4.jpg",
    name: "Modern Dera",
    description:
      "A contemporary take on the traditional Dera with a modern touch.",
    category: "Deras",
    sizes: ["M", "L"],
    colors: [
      { name: "Purple", image: "/images/products/dera_purple.jpg", stock: 10 },
      { name: "Navy", image: "/images/products/dera_navy.jpg", stock: 12 },
    ],
    rating: { stars: 4.6, count: 60 },
    stock: 22,
    priceCents: 57900,
    salePriceCents: 49900,
    keywords: ["dera", "modern", "fashion"],
  },
  // Newly Added Kaftans
  {
    image: "/images/products/dera5.jpg",
    name: "Maroon Pixelated Kaftan",
    description:
      "Elegant maroon kaftan with a pixelated pattern and decorative details.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      {
        name: "Maroon",
        image: "/images/products/kaftan_maroon.jpg",
        stock: 25,
      },
    ],
    rating: { stars: 4.8, count: 50 },
    stock: 25,
    priceCents: 35000,
    salePriceCents: 32000,
    keywords: ["kaftan", "elegant", "maroon"],
  },
  {
    image: "/images/products/dera6.jpg",
    name: "Red Feather-Pattern Kaftan",
    description:
      "Stylish red kaftan featuring a stunning feather-like pattern.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      { name: "Red", image: "/images/products/kaftan_red.jpg", stock: 20 },
    ],
    rating: { stars: 4.7, count: 45 },
    stock: 20,
    priceCents: 38000,
    salePriceCents: 35000,
    keywords: ["kaftan", "feather pattern", "red"],
  },
  {
    image: "/images/products/dera7.jpg",
    name: "Cream & Yellow Abstract Kaftan",
    description: "Unique cream and yellow kaftan with an abstract pattern.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      {
        name: "Cream/Yellow",
        image: "/images/products/kaftan_cream_yellow.jpg",
        stock: 30,
      },
    ],
    rating: { stars: 4.6, count: 38 },
    stock: 30,
    priceCents: 32000,
    salePriceCents: 29000,
    keywords: ["kaftan", "abstract", "cream yellow"],
  },
  {
    image: "/images/products/dera8.jpg",
    name: "Maroon Pixelated Kaftan",
    description:
      "Elegant maroon kaftan with a pixelated pattern and decorative details.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      {
        name: "Maroon",
        image: "/images/products/kaftan_maroon.jpg",
        stock: 25,
      },
    ],
    rating: { stars: 4.8, count: 50 },
    stock: 25,
    priceCents: 35000,
    salePriceCents: 30000,
    keywords: ["kaftan", "elegant", "maroon"],
  },
  {
    image: "/images/products/dera9.jpg",
    name: "Red Feather-Pattern Kaftan",
    description:
      "Stylish red kaftan featuring a stunning feather-like pattern.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      { name: "Red", image: "/images/products/kaftan_red.jpg", stock: 20 },
    ],
    rating: { stars: 4.7, count: 45 },
    stock: 20,
    priceCents: 38000,
    salePriceCents: 33000,
    keywords: ["kaftan", "feather pattern", "red"],
  },
  {
    image: "/images/products/dera10.jpg",
    name: "Cream & Yellow Abstract Kaftan",
    description: "Unique cream and yellow kaftan with an abstract pattern.",
    category: "Deras",
    sizes: ["Free Size"],
    colors: [
      {
        name: "Cream/Yellow",
        image: "/images/products/kaftan_cream_yellow.jpg",
        stock: 30,
      },
    ],
    rating: { stars: 4.6, count: 38 },
    stock: 30,
    priceCents: 32000,
    salePriceCents: 27000,
    keywords: ["kaftan", "abstract", "cream yellow"],
  },
];

// Seed the database
async function seedDatabase() {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    await Product.deleteMany({ category: "Deras" });
    console.log("Existing Deras products cleared...");

    await Product.insertMany(products);
    console.log("Sample Deras products inserted successfully!");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB...");
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
}

// Run the seed script
seedDatabase();
