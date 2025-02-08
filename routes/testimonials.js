const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");

const router = express.Router();

// Define Mongoose Schema
const testimonialSchema = new mongoose.Schema({
  name: String,
  review: String,
  rating: Number,
  photo: String,
  createdAt: { type: Date, default: Date.now },
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

// ✅ Joi Validation Schema
const testimonialValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  review: Joi.string().min(10).max(500).required(),
  rating: Joi.number().min(1).max(5).required(),
  photo: Joi.string().uri().allow(null, ""),
});

// ✅ Get testimonials (only 4★ and above)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ rating: { $gte: 4 } }).sort({
      createdAt: -1,
    });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// ✅ Submit a new testimonial with Joi Validation
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const { error } = testimonialValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Create new testimonial
    const { name, review, rating, photo } = req.body;
    const newTestimonial = new Testimonial({ name, review, rating, photo });
    await newTestimonial.save();

    res.status(201).json({
      message: "Testimonial added successfully",
      testimonial: newTestimonial,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit testimonial" });
  }
});

module.exports = router;
