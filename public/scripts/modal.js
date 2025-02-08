// Function to open the modal
const openModal = (serviceName, whatsappMessage) => {
  const modal = document.getElementById("whatsappModal");
  const modalServiceName = document.getElementById("modalServiceName");
  const confirmBooking = document.getElementById("confirmBooking");

  if (!modal || !modalServiceName || !confirmBooking) {
    console.error("Modal elements not found!");
    return;
  }

  // Set the modal text and WhatsApp URL
  modalServiceName.textContent = serviceName || "General Inquiry";
  const whatsappURL = `https://wa.me/254725790947?text=${encodeURIComponent(
    whatsappMessage || ""
  )}`;
  confirmBooking.href = whatsappURL;

  // Show the modal
  modal.classList.remove("hidden");
};

// Add click listeners for 'Book Now' buttons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".open-modal").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const serviceName = button.getAttribute("data-service");
      const whatsappMessage = button.getAttribute("data-whatsapp");
      openModal(serviceName, whatsappMessage);
    });
  });

  // Add click listener for 'OK' button
  document.getElementById("confirmBooking").addEventListener("click", (e) => {
    e.preventDefault();
    const whatsappURL = e.target.href;
    if (whatsappURL) {
      window.open(whatsappURL, "_blank");
    }
    document.getElementById("whatsappModal").classList.add("hidden");
  });

  // Add click listener for 'Cancel' button
  document.getElementById("cancelModal").addEventListener("click", () => {
    document.getElementById("whatsappModal").classList.add("hidden");
  });

  // Close modal on outside click
  document.getElementById("whatsappModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("whatsappModal")) {
      document.getElementById("whatsappModal").classList.add("hidden");
    }
  });

  // Close modal on 'Escape' key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("whatsappModal").classList.add("hidden");
    }
  });
});
