document.addEventListener("DOMContentLoaded", async () => {
  const faqContainer = document.getElementById("faq-container");

  try {
    const response = await fetch("/data/faq.json");
    const faqs = await response.json();

    faqContainer.innerHTML = faqs
      .map(
        (faq, index) => `
        <div class="border-b border-gray-300">
          <button class="w-full text-left py-4 px-4 flex justify-between items-center focus:outline-none faq-toggle" data-index="${index}">
            <span class="font-semibold">${faq.question}</span>
            <span class="text-xl transition-transform duration-300 ease-in-out">&#x25BC;</span>
          </button>
          <div class="faq-answer max-h-0 overflow-hidden transition-all duration-500 ease-in-out px-4 text-gray-700">
            ${faq.answer}
          </div>
        </div>
      `
      )
      .join("");

    document.querySelectorAll(".faq-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector("span:last-child");

        answer.classList.toggle("max-h-0");
        answer.classList.toggle("py-3");
        icon.classList.toggle("rotate-180");
      });
    });
  } catch (error) {
    console.error("Failed to load FAQs:", error);
    faqContainer.innerHTML =
      "<p class='text-red-500'>Failed to load FAQs. Please try again later.</p>";
  }
});
