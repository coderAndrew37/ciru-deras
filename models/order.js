const mongoose = require("mongoose");
const Joi = require("joi");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceCents: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalCents: { type: Number, required: true },
  datePlaced: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Preparing", "Shipped", "Delivered", "Cancelled"],
    default: "Preparing", // Default to Preparing
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true, default: "Cash on Delivery" },
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
  const schema = Joi.object({
    userId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
    totalCents: Joi.number().integer().min(0).required(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/),
          quantity: Joi.number().integer().min(1).required(),
          priceCents: Joi.number().integer().min(0).required(),
        })
      )
      .min(1)
      .required(),
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^\+254\d{9}$/)
      .required(), // Kenya phone validation
    address: Joi.string().min(5).required(),
    paymentMethod: Joi.string().valid("Cash on Delivery").required(),
  });

  return schema.validate(order);
}

module.exports = {
  Order,
  validateOrder,
};
