export function lazyLoadImages() {
  // Select all images with the 'lazy' class and 'data-src' attribute
  const lazyImages = document.querySelectorAll(".lazy[data-src]");

  // Set up an Intersection Observer to check when images are in view
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // Set `src` to the value of `data-src`
        img.classList.remove("lazy"); // Remove 'lazy' class after loading
        observer.unobserve(img); // Stop observing the image once it’s loaded
      }
    });
  });

  // Start observing each lazy-loaded image
  lazyImages.forEach((img) => observer.observe(img));
}
