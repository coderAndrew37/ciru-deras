document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded, initializing search toggle...");

  // Select elements
  const searchBtn = document.querySelector("#toggle-search");
  const searchBar = document.querySelector("#search-bar");
  const closeSearch = document.querySelector("#close-search");

  if (!searchBtn || !searchBar || !closeSearch) {
    console.error("❌ searchToggle.js: One or more elements are missing!");
    return;
  }

  console.log("✅ Search toggle elements found!");

  // Open search bar
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🔍 Opening search bar...");
    searchBar.classList.add("active"); // Add class for smooth transition
  });

  // Close search bar
  closeSearch.addEventListener("click", () => {
    console.log("❌ Closing search bar...");
    searchBar.classList.remove("active"); // Remove class to hide smoothly
  });

  // Close search if clicked outside
  document.addEventListener("click", (event) => {
    if (!searchBar.contains(event.target) && event.target !== searchBtn) {
      console.log("📌 Clicked outside, closing search...");
      searchBar.classList.remove("active");
    }
  });
});
