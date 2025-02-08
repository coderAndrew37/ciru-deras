import { checkAuthentication } from "./utils/authUtils.js";
import { addToCart, updateCartQuantity } from "../data/cart.js";
import { baseUrl } from "./constants.js";

// Fetch orders
async function fetchOrders() {
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch orders");

    const data = await response.json();
    renderOrders(data.orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    document.querySelector(".js-orders-grid").innerHTML =
      "<p class='text-center text-red-600'>Error loading orders.</p>";
  }
}

// Render orders
function renderOrders(orders) {
  const ordersGrid = document.querySelector(".js-orders-grid");

  if (!orders.length) {
    ordersGrid.innerHTML =
      "<p class='text-center text-gray-600'>No orders found.</p>";
    return;
  }

  ordersGrid.innerHTML = orders.map((order) => createOrderHTML(order)).join("");
}

// Generate order HTML
function createOrderHTML(order) {
  const orderItemsHTML = order.items
    .map(
      (item) => `
    <div class="flex flex-col items-center md:flex-row md:items-start gap-4 border-b pb-4">
      <img
        src="${item.productId.image}"
        alt="${item.productId.name}"
        class="w-24 h-24 rounded object-cover"
      />
      <div class="flex-1 text-center md:text-left">
        <h3 class="font-bold text-lg">${item.productId.name}</h3>
        <p class="text-sm text-gray-500">Arriving on: ${new Date(
          item.deliveryDate
        ).toLocaleDateString()}</p>
        <p class="text-sm">Quantity: ${item.quantity}</p>
        <button
          data-product-id="${item.productId._id}"
          class="bg-idcHighlight text-black font-semibold py-2 px-4 rounded mt-2 hover:bg-yellow-500 js-buy-again"
        >
          Buy it again
        </button>
      </div>
      <div>
        <a
          href="/tracking.html?orderId=${order._id}&productId=${
        item.productId._id
      }"
          class="block text-center bg-idcPrimary text-white font-semibold py-2 px-4 rounded hover:bg-gray-700"
        >
          Track Package
        </a>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p class="text-sm text-gray-500">Order Placed</p>
          <p class="font-semibold">${new Date(
            order.datePlaced
          ).toLocaleDateString()}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total</p>
          <p class="font-semibold">KSH ${(
            order.totalCents / 100
          ).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Order ID</p>
          <p class="font-mono">${order._id}</p>
        </div>
      </div>
      ${orderItemsHTML}
    </div>
  `;
}

// Buy Again logic
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("js-buy-again")) {
    const productId = event.target.dataset.productId;

    try {
      await addToCart(productId);
      updateCartQuantity();
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product has been successfully added to your cart.",
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: "Could not add the product to your cart. Please try again.",
      });
    }
  }
});

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuthentication();
  await fetchOrders();
});
