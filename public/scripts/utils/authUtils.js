import { baseUrl } from "../constants.js";
export async function checkAuthentication() {
  try {
    const response = await fetch(`${baseUrl}/api/users/is-authenticated`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Not authenticated");

    const data = await response.json();
    if (!data.authenticated) {
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    window.location.href = "/login.html";
  }
}
