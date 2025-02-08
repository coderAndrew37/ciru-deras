import { baseUrl } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".js-contact-form");
  const spinnerContainer = document.querySelector(".spinner-container");
  const formMessage = document.querySelector(".form-message");

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Reset messages and show spinner
      formMessage.textContent = "";
      formMessage.className = "form-message hidden";
      spinnerContainer.classList.remove("hidden");

      const formData = new FormData(contactForm);
      const formObject = Object.fromEntries(formData.entries());

      // Client-side validation
      const { name, email, message } = formObject;
      if (!name || !email || !message) {
        spinnerContainer.classList.add("hidden");
        showMessage("⚠️ All fields are required.", "error");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formObject),
        });

        const result = await response.json();

        spinnerContainer.classList.add("hidden");
        if (response.ok) {
          showMessage("✅ Message sent successfully!", "success");
          contactForm.reset();
        } else {
          showMessage(
            result.error || "❌ Failed to send the message.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error submitting the form:", error);
        spinnerContainer.classList.add("hidden");
        showMessage(
          "❌ Unable to send the message. Please try again.",
          "error"
        );
      }
    });
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = "block";
  }
});
