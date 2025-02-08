// Open Modal
function openModal(productId) {
  const modal = document.getElementById(`modal-${productId}`);
  if (modal) {
    modal.classList.remove("hidden"); // Show modal
  }
}

// Close Modal
function closeModal(productId) {
  const modal = document.getElementById(`modal-${productId}`);
  if (modal) {
    modal.classList.add("hidden"); // Hide modal
  }
}
