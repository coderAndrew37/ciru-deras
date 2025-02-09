import { addToCart, updateCartQuantity } from "../../data/cart.js"; // ✅ FIX: Correct import
import { isAuthenticated } from "../utils/cartUtils.js";
import { closeModal } from "./modal.js";

export async function handleAddToCart(productId) {
  const modal = document.querySelector("#modal-product1");
  if (!modal) return;

  const selectedSize = modal.querySelector("#size")?.value;
  const quantity = parseInt(modal.querySelector("#quantity")?.value, 10) || 1;

  if (!selectedSize) {
    alert("⚠️ Please select a size before adding to the cart.");
    return;
  }

  if (!(await isAuthenticated())) {
    alert("🔒 You must be logged in to add items to your cart.");
    window.location.href = "/login.html";
    return;
  }

  try {
    await addToCart(productId, quantity);
    await updateCartQuantity();
    alert("✅ Product successfully added to the cart!");
    closeModal();
  } catch (error) {
    console.error("❌ Error adding product to cart:", error);
    alert("⚠️ Failed to add the product to the cart. Please try again.");
  }
}
