import { baseUrl } from "./constants.js";

document.addEventListener("DOMContentLoaded", async () => {
  const authContainer = document.querySelector(".js-auth-container");

  if (!authContainer) {
    console.error("Auth container not found in the DOM.");
    return;
  }

  async function fetchUserProfile() {
    try {
      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("User not authenticated.");
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  async function logout() {
    try {
      await fetch(`${baseUrl}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.reload(); // Refresh page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  async function updateAuthUI() {
    const user = await fetchUserProfile();

    if (user) {
      authContainer.innerHTML = `
        <div class="relative">
          <button id="auth-button" class="hover:text-primary">
            <i class="fas fa-user-circle text-xl"></i>
          </button>
          <div id="auth-dropdown" class="absolute right-0 mt-2 w-40 bg-white text-dark shadow-md rounded-md hidden">
            <a href="/profile" class="block px-4 py-2 hover:bg-gray-200">Profile</a>
            <button id="logout-button" class="block w-full text-left px-4 py-2 hover:bg-gray-200">Logout</button>
          </div>
        </div>
      `;

      // Add event listeners for dropdown and logout
      document.querySelector("#auth-button").addEventListener("click", () => {
        document.querySelector("#auth-dropdown").classList.toggle("hidden");
      });

      document
        .querySelector("#logout-button")
        .addEventListener("click", logout);
    } else {
      authContainer.innerHTML = `<a href="/login.html" class="hover:text-primary">Login</a>`;
    }
  }

  updateAuthUI();
});
