const VIP_KEY = "vip-membership";

// Check if user is already a VIP
function checkVIPStatus() {
  return localStorage.getItem(VIP_KEY) === "true";
}

// Show/hide button based on VIP status
function updateVIPButton() {
  const vipButton = document.querySelector("#join-vip-btn");
  if (!vipButton) return;

  if (checkVIPStatus()) {
    vipButton.textContent = "✅ You Are a VIP!";
    vipButton.disabled = true;
    vipButton.classList.add("bg-gray-500", "cursor-not-allowed");
  } else {
    vipButton.addEventListener("click", joinVIP);
  }
}

// Join VIP
function joinVIP() {
  localStorage.setItem(VIP_KEY, "true");
  alert("🎉 Welcome to the VIP Program! Enjoy your exclusive perks.");
  updateVIPButton();
}

// Initialize VIP check
document.addEventListener("DOMContentLoaded", updateVIPButton);
