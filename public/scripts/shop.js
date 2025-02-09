import { fetchProducts, renderProducts } from "./products.js";

// Selectors
const productContainer = document.querySelector(".shop-products-grid");
const filterForm = document.querySelector("#filter-form");
const resetFiltersBtn = document.querySelector("#reset-filters");
const paginationContainer = document.querySelector(".pagination");

// Default filter & sort settings
let filters = {
  category: "",
  size: "",
  color: "",
  sort: "",
  page: 1,
  limit: 12,
};

// Fetch & render products
async function loadProducts() {
  const products = await fetchProducts(
    filters.category,
    filters.page,
    filters.limit,
    filters.size,
    filters.color,
    filters.sort
  );
  renderProducts(products, productContainer);
}

// Handle filter form submission
filterForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  filters.category = document.querySelector("#category-filter").value;
  filters.size = document.querySelector("#size-filter").value;
  filters.color = document.querySelector("#color-filter").value;
  filters.sort = document.querySelector("#sort-filter").value;
  filters.page = 1; // Reset to page 1 on filter change
  loadProducts();
});

// Handle reset filters
resetFiltersBtn?.addEventListener("click", () => {
  document.querySelector("#filter-form").reset();
  filters = { category: "", size: "", color: "", sort: "", page: 1, limit: 12 };
  loadProducts();
});

// Handle pagination
paginationContainer?.addEventListener("click", (e) => {
  if (e.target.matches(".page-link")) {
    filters.page = parseInt(e.target.dataset.page, 10);
    loadProducts();
  }
});

// Initial Load
document.addEventListener("DOMContentLoaded", loadProducts);
