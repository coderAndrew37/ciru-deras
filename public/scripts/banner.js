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
      // 🔽 Scrolling Down: Hide banner, move nav to top, shrink height
      promoBanner.style.transform = "translateY(-100%)";
      navbar.style.top = "0px";
      navbar.classList.add("py-2"); // Reduce padding
      navbar.classList.remove("py-4"); // Remove extra height
    } else {
      // 🔼 Scrolling Up: Show banner, push nav down, restore height
      promoBanner.style.transform = "translateY(0)";
      navbar.style.top = `${bannerHeight}px`;
      navbar.classList.add("py-4"); // Restore full padding
      navbar.classList.remove("py-2"); // Remove shrink effect
    }

    lastScrollTop = scrollTop;
  });
});
