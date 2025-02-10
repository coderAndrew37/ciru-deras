import "./menuToggle.js";
import "./searchToggle.js";
import { handleAddToCart, isAuthenticated } from "./utils/cartUtils.js";
import { showToast } from "./toast.js";

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

  if (!wishlistCount) return;

  if (wishlist.length > 0) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.classList.remove("hidden");
  } else {
    wishlistCount.classList.add("hidden");
  }
}

// Toggle wishlist item (add/remove)
export function toggleWishlist(product) {
  let wishlist = getWishlist();
  const index = wishlist.findIndex((item) => item._id === product._id);

  const wishlistButton = document.querySelector(
    `[data-id="${product._id}"].wishlist-btn`
  );

  if (wishlistButton) {
    wishlistButton.textContent = "⏳ Processing...";
    wishlistButton.disabled = true;
  }

  setTimeout(() => {
    if (index === -1) {
      wishlist.push(product);
      showToast("✅ Added to Wishlist!", "success");
      if (wishlistButton) {
        requestAnimationFrame(() => {
          wishlistButton.textContent = "♥ Remove from Wishlist";
        });
      }
    } else {
      wishlist.splice(index, 1);
      showToast("❌ Removed from Wishlist", "error");
      if (wishlistButton) {
        requestAnimationFrame(() => {
          wishlistButton.textContent = "♥ Add to Wishlist";
        });
      }
    }

    saveWishlist(wishlist);
    updateWishlistCount();
    updateWishlistPage();

    if (wishlistButton) wishlistButton.disabled = false;
  }, 0);
}

// Render wishlist items on wishlist.html
function renderWishlist() {
  const wishlistContainer = document.querySelector("#wishlist-items");
  if (!wishlistContainer) return;

  wishlistContainer.innerHTML = "";
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
      <p class="text-primary font-bold mt-1">Ksh ${(
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

    productCard
      .querySelector(".remove-wishlist-btn")
      .addEventListener("click", () => {
        toggleWishlist(product);
      });

    productCard
      .querySelector(".move-to-cart-btn")
      .addEventListener("click", async (event) => {
        const button = event.target;

        if (!(await isAuthenticated())) {
          showToast(
            "🔒 You must be logged in to add items to your cart.",
            "warning"
          );
          setTimeout(() => {
            window.location.href = "/login.html";
          }, 1500);
          return;
        }

        button.style.pointerEvents = "none";
        button.style.opacity = "0.6";
        requestAnimationFrame(() => {
          button.textContent = "⏳ Moving...";
        });

        try {
          await handleAddToCart(product._id, button);
          toggleWishlist(product);
          showToast("✅ Moved to cart successfully!", "success");
        } catch (error) {
          console.error("❌ Error moving to cart:", error);
          showToast("⚠️ Failed to move item to cart.", "error");
        } finally {
          button.style.pointerEvents = "auto";
          button.style.opacity = "1";
          button.textContent = "🛒 Move to Cart";
        }
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
  updateWishlistCount();
  updateWishlistPage();
});
