import { checkAuthentication } from "./utils/authUtils.js";
import { baseUrl } from "./constants.js";

/**
 * Fetch tracking details for a specific order.
 * @param {string} orderId - The ID of the order.
 */
async function fetchTrackingDetails(orderId) {
  try {
    const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tracking details: ${response.status}`);
    }

    const order = await response.json();

    if (!order.items || order.items.length === 0) {
      document.querySelector("#products-section").innerHTML =
        "<p class='text-gray-500'>No products found in this order.</p>";
      return;
    }

    // Render the tracking details for all products
    renderTrackingDetails(order);
  } catch (error) {
    console.error("Error fetching tracking details:", error);
    document.querySelector("#products-section").innerHTML =
      "<p class='text-red-600'>Error loading tracking details. Please try again later.</p>";
  }
}

/**
 * Render the tracking details for all products in the order.
 * @param {object} order - The full order details.
 */
function renderTrackingDetails(order) {
  const productsSection = document.querySelector("#products-section");
  productsSection.innerHTML = ""; // Clear the loading message

  order.items.forEach((product) => {
    const progressPercentage =
      {
        Preparing: "33%",
        Shipped: "66%",
        Delivered: "100%",
      }[order.status] || "0%";

    const productCard = `
      <div class="border-b border-gray-200 pb-6 mb-6">
        <!-- Delivery Date -->
        <h2 class="text-xl font-bold mb-4">
          Arriving on ${new Date(product.deliveryDate).toLocaleDateString()}
        </h2>

        <!-- Product Details -->
        <div class="flex items-center space-x-6">
          <img
            src="${
              product.productId.image || "/images/product-placeholder.png"
            }"
            alt="${product.productId.name}"
            class="w-36 h-36 rounded"
          />
          <div>
            <h3 class="text-lg font-bold">${product.productId.name}</h3>
            <p class="text-gray-600">Quantity: ${product.quantity}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6">
          <div class="flex justify-between text-sm font-medium mb-2">
            <span>Preparing</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
          <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full bg-green-600 rounded-full"
              style="width: ${progressPercentage}"
            ></div>
          </div>
        </div>
      </div>
    `;

    // Append the product card to the products section
    productsSection.innerHTML += productCard;
  });
}

/**
 * Parse query parameters from the URL.
 * @returns {object} - An object containing `orderId`.
 */
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  if (!orderId) {
    throw new Error("Invalid or missing query parameters.");
  }

  return { orderId };
}

// Initialize the tracking page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();

  try {
    const { orderId } = getQueryParams();
    fetchTrackingDetails(orderId);
  } catch (error) {
    console.error("Error:", error.message);
    document.querySelector("#products-section").innerHTML =
      "<p class='text-red-600'>Invalid tracking link. Please check the URL and try again.</p>";
  }
});
