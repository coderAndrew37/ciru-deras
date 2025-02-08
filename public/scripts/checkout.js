import { checkAuthentication } from "./utils/authUtils.js";
import { renderOrderSummary } from "./renderOrderSummary.js";
import { updateCartQuantity } from "../data/cart.js";

let cartItems = [];
let totalCents = 0;

const isValidPhoneNumber = (phone) =>
  /^\+\d{1,3}\s?\d{3}\s?\d{6,}$/.test(phone);

async function fetchCartItems() {
  try {
    const response = await fetch("/api/cart/get-cart", {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      cartItems = data.cart || [];
      const productIds = cartItems.map((item) => item.productId).join(",");
      const productResponse = await fetch(
        `/api/products/by-ids?ids=${productIds}`
      );
      if (productResponse.ok) {
        const products = await productResponse.json();
        cartItems = cartItems.map((item) => {
          const matchingProduct = products.find(
            (product) => product._id === item.productId
          );
          return {
            ...item,
            name: matchingProduct?.name || "Unknown Item",
            priceCents: matchingProduct?.priceCents || 0,
          };
        });
      } else {
        console.warn("Could not fetch product details.");
      }
    } else {
      console.warn("Could not fetch cart items.");
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
  }
}

function attachCartEventListeners() {
  document.querySelectorAll(".js-quantity-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const productId = event.target.dataset.productId;
      const newQuantity = parseInt(event.target.value, 10);
      await updateQuantity(productId, newQuantity);
      await renderOrderSummary();
      updateCartQuantity();
    });
  });

  document.querySelectorAll(".js-delete-quantity-link").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = event.target.dataset.productId;
      await updateQuantity(productId, 0);
      await renderOrderSummary();
      updateCartQuantity();
    });
  });
}

async function updateQuantity(productId, newQuantity) {
  try {
    if (newQuantity <= 0) {
      await fetch(`/api/cart/remove-from-cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      await fetch("/api/cart/update-cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
        credentials: "include",
      });
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

async function prefillOrderForm() {
  try {
    const response = await fetch("/api/users/profile", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const userData = await response.json();
      document.getElementById("name").value = userData?.name || "";
      document.getElementById("email").value = userData?.email || "";
    } else {
      console.warn("Could not fetch user profile.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

function showSuccessAlert() {
  Swal.fire({
    icon: "success",
    title: "Order Placed Successfully!",
    text: "Your order has been submitted. You will receive a confirmation email shortly.",
    confirmButtonText: "View Orders",
    confirmButtonColor: "#FFD420",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/orders.html";
    }
  });
}

// Close the modal when clicking outside or pressing the close button
function setupModalCloseBehavior() {
  const modal = document.getElementById("orderDetailsModal");
  const closeButton = document.querySelector(".close-button");

  // Close modal on outside click
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Close modal on clicking the close button
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
}

document
  .getElementById("orderDetailsForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    if (!isValidPhoneNumber(phone)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Please enter a valid phone number in the format +254 712 345678.",
      });
      return;
    }

    const itemsForSubmission = cartItems.map(
      ({ productId, quantity, priceCents }) => ({
        productId,
        quantity,
        priceCents,
      })
    );

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone,
      address: document.getElementById("address").value,
      paymentMethod: "Cash on Delivery",
      items: itemsForSubmission,
      totalCents,
    };

    try {
      Swal.fire({
        title: "Placing Order...",
        text: "Please wait while your order is being submitted.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order submission error details:", errorData);
        throw new Error("Failed to place order");
      }

      Swal.close();
      showSuccessAlert();
      document.getElementById("orderDetailsModal").style.display = "none";
    } catch (error) {
      console.error("Error placing order:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Could not place order. Please try again.",
      });
    }
  });

document.addEventListener("DOMContentLoaded", async () => {
  checkAuthentication();
  await fetchCartItems();
  await renderOrderSummary();
  updateCartQuantity();
  attachCartEventListeners();
  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("place-order-button")) {
      event.preventDefault();
      await prefillOrderForm();
      document.getElementById("orderDetailsModal").style.display = "flex";
    }
  });
  setupModalCloseBehavior();
});
