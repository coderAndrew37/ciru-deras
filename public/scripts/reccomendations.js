import { baseUrl } from "./constants.js";
const recommendationInput = document.querySelector("#recommendation-input");
const recommendationBtn = document.querySelector("#recommendation-btn");
const recommendationResults = document.querySelector("#recommendation-results");
const API_URL = `${baseUrl}/api/chatbot`;

async function getRecommendations() {
  const userInput = recommendationInput.value.trim();
  if (!userInput) return;

  recommendationResults.innerHTML = `<p class="text-center text-gray-500">Finding the best deras for you...</p>`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: userInput }),
    });

    const data = await response.json();
    recommendationResults.innerHTML = `<p class="text-center text-dark">${data.reply}</p>`;
  } catch (error) {
    console.error("Recommendation Error:", error);
    recommendationResults.innerHTML = `<p class="text-center text-red-500">❌ AI unavailable. Try later.</p>`;
  }
}

recommendationBtn.addEventListener("click", getRecommendations);
