const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email when an order's status changes.
 * @param {string} to - Customer's email address.
 * @param {object} order - Order details.
 * @param {string} status - New status of the order.
 */
async function sendStateChangeEmail(to, order, status) {
  const statusMessages = {
    Preparing: "Your order is now being prepared.",
    Shipped: "Your order has been shipped and is on its way.",
    Delivered: "Your order has been delivered. We hope you love it!",
    Cancelled:
      "Your order has been cancelled. If you have any questions, please contact us.",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Order Update: ${status}`,
    text: `Hello, ${order.name}. ${statusMessages[status]}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h3 style="color: #333;">Hello, ${order.name}</h3>
        <p style="color: #555;">${statusMessages[status]}</p>
        <p style="font-weight: bold; color: #333;">Order Details:</p>
        <ul style="list-style: none; padding: 0;">
          ${order.items
            .map(
              (item) => `
              <li style="margin-bottom: 10px; color: #555;">
                <span style="font-weight: bold;">${item.quantity} x ${
                item.name
              }</span>
                <span style="float: right;">Ksh ${(
                  item.priceCents / 100
                ).toFixed(2)}</span>
              </li>`
            )
            .join("")}
        </ul>
        <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
        <p style="font-size: 18px; font-weight: bold; color: #333;">Total: Ksh ${(
          order.totalCents / 100
        ).toFixed(2)}</p>
        <p style="color: #555;">If you have any questions, feel free to contact us.</p>
        <p style="color: #333; font-size: 14px;">Thank you for shopping with us!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send the order confirmation email when an order is placed.
 * @param {string} to - Customer's email address.
 * @param {object} order - Order details.
 */
async function sendOrderConfirmationEmail(to, order) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Order Confirmation",
    text: `Hello, ${order.name}. Thank you for your order! Your order is being processed.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h3 style="color: #333;">Hello, ${order.name}</h3>
        <p style="color: #555;">Thank you for your order! Your order is being processed and we will update you once it’s shipped.</p>
        <p style="font-weight: bold; color: #333;">Order Details:</p>
        <ul style="list-style: none; padding: 0;">
          ${order.items
            .map(
              (item) => `
              <li style="margin-bottom: 10px; color: #555;">
                <span style="font-weight: bold;">${item.quantity} x ${
                item.name
              }</span>
                <span style="float: right;">Ksh ${(
                  item.priceCents / 100
                ).toFixed(2)}</span>
              </li>`
            )
            .join("")}
        </ul>
        <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
        <p style="font-size: 18px; font-weight: bold; color: #333;">Total: Ksh ${(
          order.totalCents / 100
        ).toFixed(2)}</p>
        <p style="color: #555;">If you have any questions, feel free to contact us.</p>
        <p style="color: #333; font-size: 14px;">Thank you for shopping with us!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendOrderConfirmationEmail,
  sendStateChangeEmail,
};
