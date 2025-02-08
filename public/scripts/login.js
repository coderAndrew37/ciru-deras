// login.js
import { baseUrl } from "./constants.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${baseUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      if (data.isAdmin) {
        // Redirect to admin panel
        window.location.href = "/admin.html";
      } else {
        // Redirect to homepage
        window.location.href = "/";
      }
    } else if (response.status === 401) {
      alert("Session expired. Please log in again.");
    } else if (response.status === 429) {
      alert("Too many login attempts. Please wait and try again.");
    } else {
      alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred. Please try again.");
  }
});
