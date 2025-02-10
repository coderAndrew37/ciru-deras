document.addEventListener("DOMContentLoaded", () => {
  const searchToggle = document.getElementById("toggle-search");
  const searchBar = document.getElementById("search-bar");
  const closeSearch = document.getElementById("close-search");
  const searchInput = document.querySelector(".js-search-bar");
  const resultsContainer = document.querySelector(".js-products-grid");

  if (
    !searchToggle ||
    !searchBar ||
    !closeSearch ||
    !searchInput ||
    !resultsContainer
  ) {
    console.error("❌ searchToggle.js: Required elements not found.");
    return;
  }

  searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("active");
    searchInput.value = ""; // Clear search input when opening search bar
  });

  closeSearch.addEventListener("click", () => {
    searchBar.classList.remove("active");
  });

  // Close search bar when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !searchBar.contains(event.target) &&
      !searchToggle.contains(event.target)
    ) {
      searchBar.classList.remove("active");
    }
  });

  // Smooth scroll to search results
  document.querySelector(".js-search-button").addEventListener("click", () => {
    setTimeout(() => {
      resultsContainer.scrollIntoView({ behavior: "smooth" });
    }, 300);
  });
});
