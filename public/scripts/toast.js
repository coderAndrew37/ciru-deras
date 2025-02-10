export function showToast(message, type = "info") {
  const toastContainer = document.querySelector("#toast-container");

  if (!toastContainer) {
    console.error("❌ Toast container not found in the DOM");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <div class="toast-progress"></div>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Animate slide-in & progress bar
  setTimeout(() => {
    toast.classList.add("visible");
    toast.querySelector(".toast-progress").classList.add("progress");
  }, 10);

  // Remove toast when close button is clicked
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 500);
  });

  // Auto remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
