const jwt = require("jsonwebtoken");

// Use environment variables or provide fallback secrets
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Middleware to verify if the user is authenticated.
 * Validates the access token from cookies.
 */
function authMiddleware(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized. Please log in.",
      redirect: "/login.html", // Add redirect URL in the response
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please log in again.",
        redirect: "/login.html", // Add redirect URL for expired tokens
      });
    }
    res.status(403).json({ message: "Invalid token. Access denied." });
  }
}

module.exports = authMiddleware;
