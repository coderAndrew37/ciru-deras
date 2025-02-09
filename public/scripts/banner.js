document.addEventListener("DOMContentLoaded", () => {
  const promoBanner = document.getElementById("promo-banner");
  const navbar = document.getElementById("navbar");

  let lastScrollTop = 0;
  const bannerHeight = promoBanner.offsetHeight;

  // Set initial position
  navbar.style.top = `${bannerHeight}px`;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;

    if (scrollTop > lastScrollTop) {
      // 🔽 Scrolling Down: Hide banner, move nav to top
      promoBanner.style.transform = "translateY(-100%)";
      navbar.style.top = "0px"; // Nav sticks at the top
    } else {
      // 🔼 Scrolling Up: Show banner, push nav down to meet it
      promoBanner.style.transform = "translateY(0)";
      navbar.style.top = `${bannerHeight}px`; // Ensures it aligns perfectly
    }

    lastScrollTop = scrollTop;
  });
});
