import { baseUrl } from "./constants.js";
const API_URL = `${baseUrl}/api/testimonials`; // Update if deploying online

// Fetch testimonials from MongoDB (only 4★ and above)
async function fetchTestimonials() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch testimonials");

    const testimonials = await response.json();
    renderTestimonials(testimonials);
  } catch (error) {
    console.error("❌ Error fetching testimonials:", error);
  }
}

// Render testimonials dynamically
function renderTestimonials(testimonials) {
  const testimonialsGrid = document.querySelector("#testimonials-grid");
  if (!testimonialsGrid) return;

  testimonialsGrid.innerHTML = ""; // Clear previous content

  if (testimonials.length === 0) {
    testimonialsGrid.innerHTML = `<p class="text-center text-gray-500">No reviews yet. Be the first to share your experience!</p>`;
    return;
  }

  testimonials.forEach((testimonial) => {
    const testimonialCard = document.createElement("div");
    testimonialCard.className = "bg-white rounded-lg shadow-md p-6 text-center";

    testimonialCard.innerHTML = `
      <img src="${
        testimonial.photo || "/images/default-avatar.jpg"
      }" class="w-20 h-20 mx-auto rounded-full mb-4 object-cover">
      <h3 class="text-lg font-semibold text-dark">${testimonial.name}</h3>
      <p class="text-primary font-bold">${"⭐".repeat(testimonial.rating)}</p>
      <p class="text-gray-600 mt-2">${testimonial.review}</p>
    `;

    testimonialsGrid.appendChild(testimonialCard);
  });
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

// ✅ Function to open the testimonial modal
function openTestimonialModal() {
  document.querySelector("#testimonial-modal")?.classList.remove("hidden");
}

// ✅ Function to close the testimonial modal
function closeTestimonialModal() {
  document.querySelector("#testimonial-modal")?.classList.add("hidden");
}


// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchTestimonials();
  document
    .querySelector("#testimonial-form")
    ?.addEventListener("submit", submitTestimonial);
  document
    .querySelector("#open-testimonial-modal")
    ?.addEventListener("click", openTestimonialModal);
});
