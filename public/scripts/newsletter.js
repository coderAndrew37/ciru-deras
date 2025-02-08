document.addEventListener("DOMContentLoaded", () => {
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMessage = document.getElementById("newsletterMessage");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      newsletterMessage.textContent = "Subscribing...";
      newsletterMessage.style.color = "#333";

      const email = document.getElementById("newsletterEmail").value;

      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (response.ok) {
          newsletterMessage.textContent =
            result.message || "Subscribed successfully!";
          newsletterMessage.style.color = "#28a745";
          newsletterForm.reset();
        } else {
          newsletterMessage.textContent =
            result.message || "Subscription failed.";
          newsletterMessage.style.color = "#dc3545";
        }
      } catch (error) {
        newsletterMessage.textContent = "An error occurred. Please try again.";
        newsletterMessage.style.color = "#dc3545";
      }
    });
  }
});
