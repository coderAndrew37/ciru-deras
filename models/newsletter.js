const Joi = require("joi");
const mongoose = require("mongoose");

// Define the schema
const newsletterEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const NewsletterEmail = mongoose.model(
  "NewsletterEmail",
  newsletterEmailSchema
);

// Joi validation for email
const validateNewsletterEmail = (email) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate({ email });
};

// Export both the model and validation function
module.exports = { NewsletterEmail, validateNewsletterEmail };
