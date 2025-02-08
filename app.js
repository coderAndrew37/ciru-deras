require("dotenv").config();
require("./startup/db.js")(); // Initialize MongoDB connection
const express = require("express");
const path = require("path");
const logger = require("./startup/logger"); // Import the logger
const errorHandler = require("./startup/errorHandler.js"); // Import custom error handler
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie middle handlers
const cookieParser = require("cookie-parser");
app.use(cookieParser()); // Add this line

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : "*"; // Default to '*' for all origins if not set

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        allowedOrigins === "*" ||
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware to remove .html extension
app.use((req, res, next) => {
  if (!path.extname(req.path)) {
    const requestedFile = path.join(__dirname, "public", req.path + ".html");
    res.sendFile(requestedFile, (err) => {
      if (err) next(); // Continue if file not found
    });
  } else {
    next(); // Continue if path already has an extension
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Initialize all API routes
require("./startup/routes.js")(app);

// Serve undefined routes to 404.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Custom error handler for all other errors
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
