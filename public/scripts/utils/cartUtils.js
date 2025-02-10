import { baseUrl } from "../constants.js";
import { addToCart, updateCartQuantity } from "../../data/cart.js";

// Check if the user is authenticated
export async function isAuthenticated() {
  try {
    const response = await fetch(`${baseUrl}/api/users/is-authenticated`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    } else {
      const errorData = await response.json();
      console.warn("Auth Check Failed:", errorData);
    }
  } catch (error) {
    console.error("Auth check failed:", error);
  }
  return false;
}

// Initialize Add to Cart listeners
export function initAddToCartListeners() {
  const buttons = document.querySelectorAll(".js-add-to-cart");

  buttons.forEach((button) => {
    // Remove any existing listeners and replace with a new button
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);

    newButton.addEventListener("click", async (event) => {
      const productId = newButton.dataset.productId;

      if (!productId) {
        console.error("Missing productId for Add to Cart button.");
        return;
      }
      // Check authentication
      const isUserAuthenticated = await isAuthenticated();
      if (!isUserAuthenticated) {
        // Redirect to login page
        alert("You must be logged in to add items to your cart.");
        window.location.href = "/login.html";
        return;
      }

      // Proceed with adding to cart
      await handleAddToCart(productId, button);
    });
  });
}

// Handle adding a product to the cart
export async function handleAddToCart(productId, button) {
  try {
    button.disabled = true;
    button.textContent = "Adding...";

    await addToCart(productId, 1); // Add the product to the cart
    await updateCartQuantity(); // Update the cart icon in the navbar

    // Show "Added to Cart" message
    const productContainer = button.closest(".product-container");
    if (productContainer) {
      const addedMessage = productContainer.querySelector(".added-to-cart");
      if (addedMessage) {
        addedMessage.classList.remove("hidden");
        setTimeout(() => {
          addedMessage.classList.add("hidden");
        }, 2000);
      }
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    alert("Failed to add the product to the cart. Please try again.");
  } finally {
    button.disabled = false;
    button.textContent = "Add to Cart";
  }
}

// Show login redirect prompt for unauthenticated users
function showLoginRedirectPrompt() {
  const proceedToLogin = confirm(
    "You must log in to add items to your cart. Would you like to log in now?"
  );
  if (proceedToLogin) {
    window.location.href = "/login.html";
  } else {
    alert("You cannot add items to the cart without logging in.");
  }
}
