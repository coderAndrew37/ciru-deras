const products = require("../routes/products.js");
const cart = require("../routes/cart.js");
const auth = require("../routes/auth.js");
const orders = require("../routes/orders.js");
const testimonials = require("../routes/testimonials.js");
const chatbot = require("../routes/chatbot.js");
const descriptions = require("../routes/productDescriptions");
module.exports = function (app) {
  app.use("/api/products", products);
  app.use("/api/cart", cart);
  app.use("/api/users", auth);
  app.use("/api/orders", orders);
  app.use("/api/testimonials", testimonials);
  app.use("/api/chatbot", chatbot);
  app.use("/api/descriptions", descriptions);
};
