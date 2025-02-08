const mongoose = require("mongoose");
const Joi = require("joi");

// Rating schema
const ratingSchema = new mongoose.Schema({
  stars: { type: Number, required: true, min: 0, max: 5 },
  count: { type: Number, required: true, min: 0 },
});

// Color schema
const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

// Product schema
const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true, minlength: 3, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  category: { type: String, required: true },
  sizes: { type: [String], default: [] },
  colors: { type: [colorSchema], default: [] },
  rating: { type: ratingSchema, required: true },
  stock: { type: Number, required: true, min: 0 },
  priceCents: { type: Number, required: true, min: 0 },
  salePriceCents: { type: Number, min: 0 },
  type: { type: String, default: "product" },
  keywords: { type: [String], default: [] },
});

// ✅ Fix: Prevent model overwrite
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

// Joi validation function
function validateProduct(product) {
  const schema = Joi.object({
    image: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().required(),
    sizes: Joi.array()
      .items(Joi.string().valid("S", "M", "L", "XL"))
      .optional(),
    colors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          image: Joi.string().required(),
          stock: Joi.number().min(0).required(),
        })
      )
      .optional(),
    rating: Joi.object({
      stars: Joi.number().min(0).max(5).required(),
      count: Joi.number().min(0).required(),
    }).required(),
    stock: Joi.number().min(0).required(),
    priceCents: Joi.number().min(0).required(),
    salePriceCents: Joi.number().min(0).optional(),
    type: Joi.string().valid("product").optional(),
    keywords: Joi.array().items(Joi.string()).optional(),
  });

  return schema.validate(product);
}

module.exports = { Product, validateProduct };
