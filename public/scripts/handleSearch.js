import { baseUrl } from "./constants.js";
import { renderProducts } from "./utils/renderUtils.js";
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.querySelector(".js-search-button");
  const searchBar = document.querySelector(".js-search-bar");
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );

  searchButton.addEventListener("click", handleSearch);
  searchBar.addEventListener("input", handleSuggestions); // Trigger suggestions on input
  searchBar.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
});

async function handleSuggestions(event) {
  const query = event.target.value.trim();
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );

  if (query.length === 0) {
    suggestionsDropdown.innerHTML = ""; // Clear suggestions if input is empty
    return;
  }

  console.log("Searching suggestions for:", query); // Debugging log

  try {
    const suggestions = await fetchSuggestions(query);
    console.log("Fetched suggestions:", suggestions); // Debugging log

    if (suggestions.length > 0) {
      suggestionsDropdown.innerHTML = suggestions
        .map(
          (suggestion) =>
            `<div class="suggestion-item">${suggestion.name}</div>`
        )
        .join("");

      // Attach click event to each suggestion item
      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          document.querySelector(".search-bar").value = item.textContent;
          handleSearch(); // Trigger search with selected suggestion
          suggestionsDropdown.innerHTML = ""; // Clear suggestions after selection
        });
      });
    } else {
      suggestionsDropdown.innerHTML = "<p>No suggestions found.</p>";
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestionsDropdown.innerHTML = "<p>Error fetching suggestions.</p>";
  }
}

const suggestionsCache = {}; // Cache object for suggestions

async function fetchSuggestions(query) {
  if (suggestionsCache[query]) {
    console.log("Using cached suggestions for:", query);
    return suggestionsCache[query];
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/products/suggestions?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }
    const data = await response.json();
    suggestionsCache[query] = Array.isArray(data) ? data : []; // Cache the results
    return suggestionsCache[query];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

async function handleSearch() {
  const searchTerm = document.querySelector(".js-search-bar").value.trim();
  const resultsContainer = document.querySelector(".js-products-grid");
  const spinner = document.getElementById("loadingSpinner");

  if (searchTerm) {
    // Show spinner and clear existing content
    spinner.classList.remove("hidden");
    resultsContainer.innerHTML = "";

    try {
      const results = await searchProducts(searchTerm); // Fetch search results
      console.log("Search results:", results);

      if (Array.isArray(results) && results.length > 0) {
        renderProducts(results, ".js-products-grid"); // Render results
        document
          .querySelector("#featured-products")
          .scrollIntoView({ behavior: "smooth" });
      } else {
        resultsContainer.innerHTML = "<p>No results found.</p>";
      }
    } catch (error) {
      console.error("Search failed:", error);
      resultsContainer.innerHTML =
        "<p>Error loading search results. Please try again later.</p>";
    } finally {
      spinner.classList.add("hidden"); // Hide spinner
    }
  }
}

async function searchProducts(query) {
  try {
    const response = await fetch(
      `${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    const data = await response.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return []; // Ensure an array is always returned
  }
}
