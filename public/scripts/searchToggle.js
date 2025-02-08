// Select elements
const searchBtn = document.getElementById("search-btn");
const searchBar = document.getElementById("search-bar");
const closeSearch = document.getElementById("close-search");

// Open Search Bar
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchBar.classList.add("active");
  searchBar.style.display = "block"; // Ensure it's visible
});

// Close Search Bar
closeSearch.addEventListener("click", () => {
  searchBar.classList.remove("active");
  setTimeout(() => {
    searchBar.style.display = "none"; // Hide after animation
  }, 500); // Match transition duration
});
