const slides = document.querySelectorAll(".carousel-item");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

let currentIndex = 0;
let interval;

// Function to update slide visibility
function updateSlides(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("opacity-100", i === index);
    slide.classList.toggle("opacity-0", i !== index);
  });
}

// Show the previous slide
function showPrevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateSlides(currentIndex);
}

// Show the next slide
function showNextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlides(currentIndex);
}

// Start autoplay
function startAutoplay() {
  interval = setInterval(showNextSlide, 5000);
}

// Stop autoplay
function stopAutoplay() {
  clearInterval(interval);
}

// Event listeners
prevButton.addEventListener("click", () => {
  stopAutoplay();
  showPrevSlide();
  startAutoplay();
});

nextButton.addEventListener("click", () => {
  stopAutoplay();
  showNextSlide();
  startAutoplay();
});

// Start autoplay on page load
updateSlides(currentIndex);
startAutoplay();
