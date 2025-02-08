import { baseUrl } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const authButton = document.querySelector(".js-auth-button");

  async function isAuthenticated() {
    try {
      const response = await fetch(`${baseUrl}/api/users/is-authenticated`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }

  async function logout() {
    try {
      await fetch(`${baseUrl}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  async function updateAuthButton() {
    const loggedIn = await isAuthenticated();
    authButton.textContent = loggedIn ? "Logout" : "Login";
    authButton.onclick = loggedIn ? handleLogout : handleLogin;

    // Set background color based on authentication state
    authButton.style.backgroundColor = loggedIn ? "red" : "blue";
  }

  function handleLogin() {
    window.location.href = "/login.html";
  }

  async function handleLogout() {
    await logout();
    updateAuthButton();
    window.location.href = "/";
  }

  updateAuthButton();
});
