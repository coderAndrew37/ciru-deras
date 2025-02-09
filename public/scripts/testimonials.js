import { baseUrl } from "./constants.js";
const API_URL = `${baseUrl}/api/testimonials`;

let currentSlide = 0;
let autoSlideInterval;

// Fetch and render testimonials
async function fetchTestimonials() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch testimonials");

    const testimonials = await response.json();
    setupCarousel(testimonials);
  } catch (error) {
    console.error("❌ Error fetching testimonials:", error);
  }
}

// Create and set up the carousel
function setupCarousel(testimonials) {
  const container = document.querySelector("#testimonial-carousel");
  const indicators = document.querySelector("#testimonial-indicators");

  if (!container || !indicators) return;

  container.innerHTML = "";
  indicators.innerHTML = "";

  testimonials.forEach((testimonial, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-slide transition-opacity duration-700 ease-in-out absolute inset-0 ${
      index === 0 ? "opacity-100" : "opacity-0"
    }`;

    slide.innerHTML = `
      <div class="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md mx-auto max-w-lg">
        <img src="${testimonial.photo || "/images/default-avatar.jpg"}" 
          class="w-16 h-16 rounded-full object-cover mb-3">
        <h3 class="text-lg font-semibold text-dark">${testimonial.name}</h3>
        <p class="text-primary font-bold">${"⭐".repeat(testimonial.rating)}</p>
        <p class="text-gray-600 mt-2">${testimonial.review}</p>
      </div>
    `;
    container.appendChild(slide);

    // Add indicator dots
    const dot = document.createElement("span");
    dot.className = `h-3 w-3 mx-1 bg-gray-400 rounded-full cursor-pointer ${
      index === 0 ? "bg-primary" : ""
    }`;
    dot.addEventListener("click", () => updateSlide(index));
    indicators.appendChild(dot);
  });

  startAutoSlide(testimonials.length);

  // Attach navigation buttons
  document
    .querySelector("#prev-testimonial")
    .addEventListener("click", () => changeSlide(-1, testimonials.length));
  document
    .querySelector("#next-testimonial")
    .addEventListener("click", () => changeSlide(1, testimonials.length));

  // Pause auto-slide on hover
  container.addEventListener("mouseenter", stopAutoSlide);
  container.addEventListener("mouseleave", () =>
    startAutoSlide(testimonials.length)
  );
}

// Auto-slide every 5s
function startAutoSlide(totalSlides) {
  stopAutoSlide(); // Clear any existing interval before starting a new one
  autoSlideInterval = setInterval(() => {
    changeSlide(1, totalSlides);
  }, 5000);
}

// Stop auto-slide when interacting
function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// Navigate slides manually (loop back at the end)
function changeSlide(direction, totalSlides) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateSlide(currentSlide);
}

// Update slide based on index
function updateSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll("#testimonial-indicators span");

  slides.forEach((slide, i) => {
    slide.classList.toggle("opacity-100", i === index);
    slide.classList.toggle("opacity-0", i !== index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("bg-primary", i === index);
    dot.classList.toggle("bg-gray-400", i !== index);
  });

  currentSlide = index;
}

// Submit testimonial to MongoDB
async function submitTestimonial(event) {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const review = document.querySelector("#review").value.trim();
  const rating = parseInt(document.querySelector("#rating").value);
  const photoInput = document.querySelector("#photo");

  if (!name || !review || !rating) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  // Convert photo to Base64
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const newTestimonial = {
        name,
        review,
        rating,
        photo: reader.result || null,
      };
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestimonial),
      });

      if (!response.ok) throw new Error("Failed to submit testimonial");

      alert("✅ Thank you for your review!");
      closeTestimonialModal();
      fetchTestimonials(); // Reload testimonials
    } catch (error) {
      console.error("❌ Error submitting testimonial:", error);
    }
  };

  if (photoInput.files.length > 0) {
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    reader.onload();
  }
}

// Open the testimonial modal
function openTestimonialModal() {
  document.querySelector("#testimonial-modal")?.classList.remove("hidden");
}

// Close the testimonial modal
function closeTestimonialModal() {
  document.querySelector("#testimonial-modal")?.classList.add("hidden");
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchTestimonials();
  document
    .querySelector("#testimonial-form")
    ?.addEventListener("submit", submitTestimonial);
  document
    .querySelector("#open-testimonial-modal")
    ?.addEventListener("click", openTestimonialModal);
});
