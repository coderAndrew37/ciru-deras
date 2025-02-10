document.addEventListener("DOMContentLoaded", () => {
  const searchToggle = document.getElementById("toggle-search");
  const searchBar = document.getElementById("search-bar");
  const closeSearch = document.getElementById("close-search");

  if (!searchToggle || !searchBar || !closeSearch) {
    console.error("❌ searchToggle.js: Required elements not found.");
    return;
  }

  searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("active");
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
});
