import { baseUrl } from "./constants.js";

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${baseUrl}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store user details in local storage if needed for frontend display
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      // Redirect to the login page or homepage after registration
      window.location.href = "/";
    } else if (response.status === 400) {
      alert(data.message || "Registration failed. Please check your input.");
    } else {
      alert("An error occurred during registration. Please try again.");
    }
  } catch (error) {
    console.error("Error registering:", error);
    alert("An error occurred. Please try again.");
  }
});
