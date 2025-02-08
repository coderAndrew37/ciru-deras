const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const crypto = require("crypto");

// Define the CartItem Schema
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1 },
});

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024, // Password will be stored as a hash
  },
  isAdmin: {
    type: Boolean,
    default: false, // Regular users by default
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  cart: [cartItemSchema],
});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  this.email = this.email.toLowerCase();
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate a password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  return resetToken;
};

// Compare a plaintext password with the stored hash
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Joi validation schema for registration
userSchema.statics.validateRegister = function (data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity({
      min: 8,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 4,
    }).required(),
  });
  return schema.validate(data);
};

// Joi validation schema for login
userSchema.statics.validateLogin = function (data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

// Joi validation schema for password reset
userSchema.statics.validatePasswordReset = function (data) {
  const schema = Joi.object({
    password: passwordComplexity({
      min: 8,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 4,
    }).required(),
  });
  return schema.validate(data);
};

//validate the cart
userSchema.statics.validateCart = function (cartItems) {
  const schema = Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  );
  return schema.validate(cartItems);
};

// Export the User model, check for existing model to avoid overwrite errors
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
