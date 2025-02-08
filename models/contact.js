const mongoose = require("mongoose");
const Joi = require("joi");

// Define Lead Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Define Joi validation schema
contactSchema.statics.validateContact = function (data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    message: Joi.string().min(5).max(500).required(),
  });
  return schema.validate(data);
};

module.exports = mongoose.model("Contact", contactSchema);
