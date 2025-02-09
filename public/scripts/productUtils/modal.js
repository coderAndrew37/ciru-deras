import { addToCart, updateCartQuantity } from "../../../data/cart.js"; // ✅ FIX: Correct import
import { isAuthenticated } from "../utils/cartUtils.js";

export function openModal(product) {
  const modal = document.querySelector("#modal-product1");
  if (!modal) return console.error("❌ Modal not found");

  modal.classList.remove("hidden");
  modal.querySelector("img").src = product.image;
  modal.querySelector("h3").textContent = product.name;
  modal.querySelector("p").textContent = `$${(product.priceCents / 100).toFixed(
    2
  )}`;

  // ✅ FIX: Use addEventListener instead of directly setting .onclick
  modal
    .querySelector(".add-to-cart")
    .removeEventListener("click", addToCartHandler);
  modal
    .querySelector(".add-to-cart")
    .addEventListener("click", () => addToCartHandler(product._id));
}

async function addToCartHandler(productId) {
  if (!(await isAuthenticated())) return alert("🔒 Login required.");
  await addToCart(productId, 1);
  updateCartQuantity();
  alert("✅ Added to cart!");
}

export function closeModal() {
  document.querySelector("#modal-product1")?.classList.add("hidden");
}
