import "./menuToggle.js";
import "./searchToggle.js";
import { handleAddToCart } from "./utils/cartUtils.js";

// Wishlist functionality
const WISHLIST_KEY = "wishlist-items";

// Get wishlist from localStorage
function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

// Update wishlist quantity badge in the navbar
function updateWishlistCount() {
  const wishlist = getWishlist();
  const wishlistCount = document.querySelector(".js-wishlist-quantity");

  if (!wishlistCount) return; // 🛠 Fix: Prevent error if element is missing

  if (wishlist.length > 0) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.classList.remove("hidden"); // Show badge
  } else {
    wishlistCount.classList.add("hidden"); // Hide badge if empty
  }
}

// Toggle wishlist item (add/remove)
export function toggleWishlist(product) {
  let wishlist = getWishlist();
  const index = wishlist.findIndex((item) => item._id === product._id);

  // Find the wishlist button on the page
  const wishlistButton = document.querySelector(
    `[data-id="${product._id}"].wishlist-btn`
  );

  if (wishlistButton) {
    wishlistButton.textContent = "⏳ Processing...";
    wishlistButton.disabled = true; // Prevent multiple clicks
  }

  setTimeout(() => {
    if (index === -1) {
      wishlist.push(product);
      alert("✅ Added to Wishlist!");
      if (wishlistButton) wishlistButton.textContent = "♥ Remove from Wishlist";
    } else {
      wishlist.splice(index, 1);
      alert("❌ Removed from Wishlist!");
      if (wishlistButton) wishlistButton.textContent = "♥ Add to Wishlist";
    }

    saveWishlist(wishlist);
    updateWishlistCount();
    updateWishlistPage();

    if (wishlistButton) wishlistButton.disabled = false; // Re-enable button
  }, 500); // 🕒 Simulating progress
}

// Render wishlist items on wishlist.html
function renderWishlist() {
  const wishlistContainer = document.querySelector("#wishlist-items");
  if (!wishlistContainer) return;

  wishlistContainer.innerHTML = ""; // Clear previous content
  const wishlist = getWishlist();

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = `<p class="text-center text-gray-500">Your wishlist is empty.</p>`;
    return;
  }

  wishlist.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className =
      "group bg-white rounded-lg shadow-md overflow-hidden p-4";

    productCard.innerHTML = `
      <img src="${product.image}" alt="${
      product.name
    }" class="w-full h-48 object-cover rounded-md" />
      <h3 class="text-lg font-semibold text-dark mt-2">${product.name}</h3>
      <p class="text-primary font-bold mt-1">$${(
        product.priceCents / 100
      ).toFixed(2)}</p>
      <button class="move-to-cart-btn bg-primary text-dark py-2 px-4 rounded-md mt-2" data-id="${
        product._id
      }">
        🛒 Move to Cart
      </button>
      <button class="remove-wishlist-btn text-red-500 mt-2" data-id="${
        product._id
      }">
        ❌ Remove
      </button>
    `;

    // Remove from Wishlist
    productCard
      .querySelector(".remove-wishlist-btn")
      .addEventListener("click", () => toggleWishlist(product));

    // Move to Cart
    productCard
      .querySelector(".move-to-cart-btn")
      .addEventListener("click", async () => {
        await handleAddToCart(product._id);
        toggleWishlist(product); // Remove from wishlist after adding to cart
      });

    wishlistContainer.appendChild(productCard);
  });
}

// Update wishlist page dynamically
function updateWishlistPage() {
  if (document.querySelector("#wishlist-items")) {
    renderWishlist();
  }
}

// Initialize wishlist on page load
document.addEventListener("DOMContentLoaded", () => {
  updateWishlistCount(); // Show the wishlist count in the navbar
  updateWishlistPage();
});
