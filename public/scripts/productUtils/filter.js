import { fetchProducts } from "./api.js";
import { renderProducts } from "./render.js";

export async function handleFilters() {
  const filters = {
    category: document.getElementById("filter-category")?.value || "",
    price: document.getElementById("filter-price")?.value || "",
    size: document.getElementById("filter-size")?.value || "",
    color: document.getElementById("filter-color")?.value || "",
  };

  localStorage.setItem("productFilters", JSON.stringify(filters));
  const products = await fetchProducts(filters);
  renderProducts(products, document.querySelector("#deras .grid"));
}

// ✅ FIX: Restore saved filters before applying them
export function applySavedFilters() {
  const savedFilters = JSON.parse(localStorage.getItem("productFilters")) || {};
  document.getElementById("filter-category").value =
    savedFilters.category || "";
  document.getElementById("filter-price").value = savedFilters.price || "";
  document.getElementById("filter-size").value = savedFilters.size || "";
  document.getElementById("filter-color").value = savedFilters.color || "";

  handleFilters();
}
