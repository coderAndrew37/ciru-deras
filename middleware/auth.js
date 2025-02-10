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
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { userId: decoded.userId }; // Ensure userId is correctly stored
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ authenticated: false });
  }
}

module.exports = authMiddleware;
