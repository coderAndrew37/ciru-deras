import { generateShareButtons } from "../socialShare.js";
import { openModal } from "./modal.js";
import { toggleWishlist } from "../wishList.js";
export function renderProducts(products, container) {
  if (!container) {
    console.error(`❌ Container not found`);
    return;
  }
  container.innerHTML = "";

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
        <p class="text-primary font-bold mt-2">$${(
          product.priceCents / 100
        ).toFixed(2)}</p>
      </div>
      <div class="flex justify-between items-center p-4">
        <button class="wishlist-btn text-gray-500 hover:text-red-500 transition" data-id="${
          product._id
        }">♥ Add to Wishlist</button>
        <button class="quick-add-btn bg-primary text-dark py-2 px-4 rounded-md" data-id="${
          product._id
        }">Quick Add</button>
      </div>
    `;

    // ✅ FIX: Attach event listeners properly
    productCard
      .querySelector(".quick-add-btn")
      .addEventListener("click", () => openModal(product));
    productCard
      .querySelector(".wishlist-btn")
      .addEventListener("click", () => toggleWishlist(product));

    productCard.appendChild(generateShareButtons(product));
    container.appendChild(productCard);
  });
}

export function renderCustomers(customerImages, container) {
  if (!container) {
    console.error(`❌ Customer showcase container not found`);
    return;
  }

  container.innerHTML = "";

  customerImages.forEach((image) => {
    const img = document.createElement("img");
    img.src = image;
    img.className = "w-full rounded-lg shadow-lg";
    img.alt = "Customer wearing product";
    container.appendChild(img);
  });
}
