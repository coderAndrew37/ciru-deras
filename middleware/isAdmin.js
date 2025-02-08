const User = require("../models/user.js"); // Import the User model

async function adminMiddleware(req, res, next) {
  try {
    console.log("adminMiddleware: User ID from Token:", req.user.userId); // Debug log
    const user = await User.findById(req.user.userId);

    if (!user) {
      console.log("adminMiddleware: User not found"); // Debug log
      return res
        .status(403)
        .json({ message: "Access denied. User not found." });
    }

    if (!user.isAdmin) {
      console.log("adminMiddleware: User is not an admin"); // Debug log
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    console.log("adminMiddleware: User is an admin"); // Debug log
    next();
  } catch (error) {
    console.error("adminMiddleware: Error occurred:", error.message); // Debug log
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = adminMiddleware;
