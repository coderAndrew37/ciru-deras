document.addEventListener("DOMContentLoaded", () => {
  // Select all toggle buttons
  const toggleButtons = document.querySelectorAll("[id^='togglePassword']");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling; // Find the associated input field
      if (input && input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
      } else if (input) {
        input.type = "password";
        button.textContent = "Show";
      }
    });
  });
});
