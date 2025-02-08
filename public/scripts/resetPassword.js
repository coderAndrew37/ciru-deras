import { baseUrl } from "./constants";

document
  .getElementById("reset-password-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("new-password").value;

    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      alert("Invalid or missing reset token.");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/password-reset/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Password reset successfully.");
        window.location.href = "/login.html"; // Redirect to login page
      } else {
        alert(data.message || "Password reset failed.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred. Please try again.");
    }
  });
