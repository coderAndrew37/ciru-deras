import { baseUrl } from "./constants.js";
import { renderProducts } from "./products.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded, initializing search functionality...");

  const searchButton = document.querySelector(".js-search-button");
  const searchInput = document.querySelector(".js-search-bar");
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );
  const resultsContainer = document.querySelector(".js-products-grid");
  const spinner = document.getElementById("loadingSpinner");

  // Capture search filters
  const searchFilters = {
    category: document.querySelector("#search-category"),
    size: document.querySelector("#size-filter"),
    color: document.querySelector("#color-filter"),
    sort: document.querySelector("#sort-filter"),
  };

  // 🚨 Check if any required elements are missing
  if (!searchButton)
    console.error("❌ handleSearch.js: searchButton NOT found.");
  if (!searchInput) console.error("❌ handleSearch.js: searchInput NOT found.");
  if (!suggestionsDropdown)
    console.error("❌ handleSearch.js: suggestionsDropdown NOT found.");
  if (!resultsContainer)
    console.error("❌ handleSearch.js: resultsContainer NOT found.");
  if (!spinner) console.error("❌ handleSearch.js: spinner NOT found.");

  // Stop execution if any essential element is missing
  if (
    !searchButton ||
    !searchInput ||
    !suggestionsDropdown ||
    !resultsContainer ||
    !spinner
  ) {
    console.error(
      "❌ handleSearch.js: Missing one or more required elements. Stopping execution."
    );
    return;
  }

  console.log("✅ All required search elements found!");

  // Attach event listeners
  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("input", debounce(handleSuggestions, 300));
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") handleSearch();
  });

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".js-suggestions-dropdown") &&
      !event.target.closest(".js-search-bar")
    ) {
      suggestionsDropdown.classList.add("hidden");
    }
  });
});

// Debounce function to limit API calls
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// Handle search suggestions
async function handleSuggestions(event) {
  const query = event.target.value.trim();
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );

  if (!query) {
    suggestionsDropdown.innerHTML = "";
    suggestionsDropdown.classList.add("hidden");
    return;
  }

  try {
    const suggestions = await fetchSuggestions(query);
    if (suggestions.length > 0) {
      suggestionsDropdown.innerHTML = suggestions
        .map(
          (s) =>
            `<div class="suggestion-item px-4 py-2 cursor-pointer">${s.name}</div>`
        )
        .join("");
      suggestionsDropdown.classList.remove("hidden");

      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          document.querySelector(".js-search-bar").value = item.textContent;
          handleSearch();
          suggestionsDropdown.classList.add("hidden");
        });
      });
    } else {
      suggestionsDropdown.innerHTML =
        "<p class='px-4 py-2'>No suggestions found.</p>";
      suggestionsDropdown.classList.remove("hidden");
    }
  } catch (error) {
    console.error("❌ Error fetching suggestions:", error);
    suggestionsDropdown.innerHTML =
      "<p class='px-4 py-2 text-red-500'>Error fetching suggestions.</p>";
  }
}

// Cache search suggestions
const suggestionsCache = {};

async function fetchSuggestions(query) {
  if (suggestionsCache[query]) return suggestionsCache[query];

  try {
    const response = await fetch(
      `${baseUrl}/api/products/suggestions?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to fetch suggestions");
    const data = await response.json();
    suggestionsCache[query] = Array.isArray(data) ? data : [];
    return suggestionsCache[query];
  } catch (error) {
    console.error("❌ Error fetching suggestions:", error);
    return [];
  }
}

// Handle search function
async function handleSearch() {
  const searchTerm = document.querySelector(".js-search-bar").value.trim();
  const resultsContainer = document.querySelector(".js-products-grid");
  const spinner = document.getElementById("loadingSpinner");

  const filters = {
    category: document.querySelector("#search-category")?.value || "",
    size: document.querySelector("#size-filter")?.value || "",
    color: document.querySelector("#color-filter")?.value || "",
    sort: document.querySelector("#sort-filter")?.value || "",
  };

  if (!searchTerm && !filters.category && !filters.size && !filters.color) {
    console.warn("⚠️ Search term or filters required");
    return;
  }

  spinner.classList.remove("hidden");
  resultsContainer.innerHTML = "";

  try {
    const results = await searchProducts(searchTerm, filters);
    if (results.length > 0) {
      renderProducts(results, resultsContainer);
    } else {
      resultsContainer.innerHTML = "<p>No results found.</p>";
    }
  } catch (error) {
    console.error("❌ Search failed:", error);
    resultsContainer.innerHTML =
      "<p class='text-red-500'>⚠️ Error loading search results.</p>";
  } finally {
    spinner.classList.add("hidden");
  }
}

// Search products with filters
async function searchProducts(query, { category, size, color, sort }) {
  let url = `${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (size) url += `&size=${encodeURIComponent(size)}`;
  if (color) url += `&color=${encodeURIComponent(color)}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch search results");
    const data = await response.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error("❌ Error fetching search results:", error);
    return [];
  }
}
