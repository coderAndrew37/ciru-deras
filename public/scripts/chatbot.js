import { baseUrl } from "./constants.js";
const chatbox = document.querySelector("#chatbox");
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const API_URL = `${baseUrl}/api/chatbot`;

async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatbox.innerHTML += `<div class="message user">🧑‍💻: ${userMessage}</div>`;
  chatInput.value = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();
    chatbox.innerHTML += `<div class="message bot">🤖: ${data.reply}</div>`;
  } catch (error) {
    console.error("Chatbot Error:", error);
    chatbox.innerHTML += `<div class="message error">❌ AI unavailable. Try later.</div>`;
  }
}

sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
