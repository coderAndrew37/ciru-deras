import "./menuToggle.js";
import "./carousel.js";
import "./searchToggle.js";
import "./modalToggle.js";
import "./testimonials.js";
import "./reccomendations.js";
import { openModal, closeModal, initializeCategories } from "./products.js";

// Ensure DOM is fully loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
  window.openModal = openModal;
  window.closeModal = closeModal;

  initializeCategories(); // Now runs only when DOM is fully loaded
});
