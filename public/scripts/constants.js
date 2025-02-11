export const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:8000" // Local environment
    : "https://ciru-deras.onrender.com"; // Production environment
