import { addToCart, updateCartQuantity } from "../data/cart.js";
import { isAuthenticated } from "./utils/cartUtils.js";
import { baseUrl } from "./constants.js";
import { toggleWishlist } from "./wishList.js";
import { generateShareButtons } from "./socialShare.js";

// Fetch products with filters
async function fetchProducts(
  category = "",
  price = "",
  size = "",
  color = "",
  sort = ""
) {
  try {
    let url = `${baseUrl}/api/products?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (size) url += `size=${encodeURIComponent(size)}&`;
    if (color) url += `color=${encodeURIComponent(color)}&`;
    if (price) url += `sort=price_${price}&`; // 'price_low' or 'price_high'
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`❌ Error fetching products:`, error);
    return [];
  }
}

// Handle filtering & sorting changes
async function handleFilters() {
  console.log("🔍 Applying filters...");

  const category = document.getElementById("filter-category")?.value || "";
  const price = document.getElementById("filter-price")?.value || "";
  const size = document.getElementById("filter-size")?.value || "";
  const color = document.getElementById("filter-color")?.value || "";

  // Save current filter settings
  const filters = { category, price, size, color };
  localStorage.setItem("productFilters", JSON.stringify(filters));

  // Fetch filtered products
  let products = await fetchProducts(category);

  // Apply size & color filters manually (if needed)
  if (size) products = products.filter((p) => p.sizes.includes(size));
  if (color) products = products.filter((p) => p.color === color);

  // Apply sorting
  if (price === "low-to-high") {
    products.sort((a, b) => a.priceCents - b.priceCents);
  } else if (price === "high-to-low") {
    products.sort((a, b) => b.priceCents - a.priceCents);
  }

  // Update the UI with new products
  renderProducts(products, document.querySelector("#deras .grid"));
}

// Render products dynamically
export function renderProducts(products, container) {
  if (!container) {
    console.error(`❌ Container not found`);
    return;
  }

  container.innerHTML = ""; // Clear previous content

  if (products.length === 0) {
    console.warn(`⚠️ No products found`);
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className =
      "group relative bg-white rounded-lg shadow-md overflow-hidden";

    productCard.innerHTML = `
      <img src="${product.image}" alt="${
      product.name
    }" class="w-full h-72 object-cover group-hover:opacity-80 transition" />
      <div class="p-4">
        <h3 class="text-lg font-semibold text-dark">${product.name}</h3>
        <p class="text-primary font-bold mt-2">Ksh ${(
          product.priceCents / 100
        ).toFixed(2)}</p>
      </div>
      <div class="flex justify-between items-center p-4">
        <button class="wishlist-btn text-gray-500 hover:text-red-500 transition" data-id="${
          product._id
        }">
          ♥ Add to Wishlist
        </button>
        <button class="quick-add-btn bg-primary text-dark py-2 px-4 rounded-md" data-id="${
          product._id
        }">
          Quick Add
        </button>
      </div>
    `;

    // Attach event listeners
    productCard
      .querySelector(".wishlist-btn")
      .addEventListener("click", () => toggleWishlist(product));
    productCard
      .querySelector(".quick-add-btn")
      .addEventListener("click", () => openModal(product));

    const shareButtons = generateShareButtons(product);
    productCard.appendChild(shareButtons);

    container.appendChild(productCard);
  });
}

async function fetchCustomerImages(category) {
  try {
    const response = await fetch("/data/customerImages.json"); // Load JSON file
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data[category] || []; // Return images for the category
  } catch (error) {
    console.error(`❌ Error fetching model images:`, error);
    return [];
  }
}

// Render customer images dynamically
function renderCustomers(customerImages, container) {
  if (!container) {
    console.error(`❌ Customer showcase container not found`);
    return;
  }

  container.innerHTML = ""; // Clear previous content

  customerImages.forEach((image) => {
    const img = document.createElement("img");
    img.src = image;
    img.className = "w-full rounded-lg shadow-lg";
    img.alt = "Customer wearing product";
    container.appendChild(img);
  });
}

// Initialize categories with alternating product & customer sections
export async function initializeCategories() {
  const categories = ["Deras", "New Arrivals"]; // Category names from JSON

  await new Promise((resolve) => {
    const checkDOM = () => {
      const allExist = categories.every((category) =>
        document.querySelector(
          `#${category.toLowerCase().replace(/\s/g, "-")} .grid`
        )
      );
      if (allExist) {
        resolve();
      } else {
        console.warn("⏳ Waiting for DOM to load product sections...");
        setTimeout(checkDOM, 100);
      }
    };
    checkDOM();
  });

  for (const category of categories) {
    const products = await fetchProducts(category);
    const customerImages = await fetchCustomerImages(category);

    const productContainer = document.querySelector(
      `#${category.toLowerCase().replace(/\s/g, "-")} .grid`
    );
    renderProducts(products, productContainer);

    const customerContainer = document.querySelector(
      `#${category.toLowerCase().replace(/\s/g, "-")}-customers .grid`
    );
    renderCustomers(customerImages, customerContainer);
  }

  updateCartQuantity();
}

// Open the modal with product details
export function openModal(product) {
  const modal = document.querySelector("#modal-product1");
  if (!modal) {
    console.error("❌ Modal not found in the DOM");
    return;
  }

  modal.classList.remove("hidden");

  // Populate modal details
  modal.querySelector("img").src = product.image;
  modal.querySelector("h3").textContent = product.name;
  modal.querySelector("p").textContent = `Ksh ${(
    product.priceCents / 100
  ).toFixed(2)}`;

  // Reset & populate size dropdown
  const sizeDropdown = modal.querySelector("#size");
  sizeDropdown.innerHTML = "";
  product.sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeDropdown.appendChild(option);
  });

  // Reset quantity input
  const quantityInput = modal.querySelector("#quantity");
  quantityInput.value = 1;

  // Attach event listeners to quantity buttons
  modal.querySelector("#increase-quantity").onclick = () => {
    quantityInput.value = parseInt(quantityInput.value, 10) + 1;
  };
  modal.querySelector("#decrease-quantity").onclick = () => {
    const currentValue = parseInt(quantityInput.value, 10);
    if (currentValue > 1) quantityInput.value = currentValue - 1;
  };

  // Add to cart functionality
  const addToCartButton = modal.querySelector(".add-to-cart");
  addToCartButton.dataset.id = product._id;
  addToCartButton.onclick = async () => {
    await handleAddToCart(product._id);
  };
}

// Close modal function
export function closeModal() {
  document.querySelector("#modal-product1")?.classList.add("hidden");
}

// Handle adding a product to the cart
async function handleAddToCart(productId) {
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

// Ensure the DOM is fully loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
  applySavedFilters();
  initializeCategories();

  // Attach event listeners to filter dropdowns
  document
    .getElementById("filter-category")
    ?.addEventListener("change", handleFilters);
  document
    .getElementById("filter-price")
    ?.addEventListener("change", handleFilters);
  document
    .getElementById("filter-size")
    ?.addEventListener("change", handleFilters);
  document
    .getElementById("filter-color")
    ?.addEventListener("change", handleFilters);

  document
    .querySelector("#modal-product1")
    ?.addEventListener("click", (event) => {
      if (
        event.target === event.currentTarget ||
        event.target.matches(".close-modal")
      ) {
        closeModal();
      }
    });
});

// Apply saved filters on page load
function applySavedFilters() {
  const filters = JSON.parse(localStorage.getItem("productFilters")) || {};

  document.getElementById("filter-category").value = filters.category || "";
  document.getElementById("filter-price").value = filters.price || "";
  document.getElementById("filter-size").value = filters.size || "";
  document.getElementById("filter-color").value = filters.color || "";

  handleFilters(); // Re-fetch products based on saved filters
}
