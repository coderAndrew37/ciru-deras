export function generateShareButtons(product) {
  if (!product || !product._id || !product.name) {
    console.error("❌ Invalid product data for sharing.");
    return document.createElement("div");
  }

  // ✅ Check if we're on the shop page or homepage
  const currentPath = window.location.pathname;
  const isShopPage = currentPath.startsWith("/shop");

  // ✅ Construct the correct product URL
  const productUrl = `${window.location.origin}/product/${product._id}`;

  // ✅ Define Social Media Share Links
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      productUrl
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      product.name
    )}&url=${encodeURIComponent(productUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      product.name + " " + productUrl
    )}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
    tiktok: `https://www.tiktok.com/`, // TikTok doesn't support direct sharing
  };

  // ✅ Create Share Buttons Container
  const container = document.createElement("div");
  container.className = "flex space-x-3 mt-3";

  // ✅ Generate Social Media Buttons
  Object.entries(shareLinks).forEach(([platform, url]) => {
    const button = document.createElement("a");
    button.href = url;
    button.target = "_blank";
    button.className =
      "p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center w-10 h-10";
    button.innerHTML = getIcon(platform);
    container.appendChild(button);
  });

  // ✅ Fix: Copy Link Button (Works for Instagram & TikTok)
  const copyButton = document.createElement("button");
  copyButton.className =
    "p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center w-10 h-10";
  copyButton.innerHTML = `<i class="fas fa-copy text-gray-600"></i>`;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      alert("✅ Link copied successfully!");
    } catch (error) {
      console.error("❌ Failed to copy link:", error);
      alert("⚠️ Failed to copy link.");
    }
  });

  container.appendChild(copyButton);
  return container;
}

// ✅ Function to return social media icons
function getIcon(platform) {
  const icons = {
    facebook: `<i class="fab fa-facebook-f text-blue-600"></i>`,
    twitter: `<i class="fab fa-twitter text-blue-400"></i>`,
    whatsapp: `<i class="fab fa-whatsapp text-green-500"></i>`,
    instagram: `<i class="fab fa-instagram text-pink-500"></i>`,
    tiktok: `<i class="fab fa-tiktok text-black"></i>`,
  };
  return icons[platform] || `<i class="fas fa-share text-gray-600"></i>`;
}
