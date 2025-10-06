window.onload = function () {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("chat-input");
  const chatbotMessages = document.getElementById("chat-output");
  const chatToggle = document.getElementById("chat-toggle");
  const chatbot = document.getElementById("chatbot");
  const closeChat = document.getElementById("close-chat");

  const chatNudge = document.getElementById("chat-nudge");
  const NUDGE_SEEN_KEY = "maurice_chat_nudge_seen";

  if (!sendBtn || !userInput || !chatbotMessages || !chatToggle || !chatbot || !closeChat) {
    console.error("One or more chatbot elements are missing in the HTML.");
    return;
  }

  /* ---------------- Toggle chatbot visibility ---------------- */
  chatToggle.addEventListener("click", () => {
    const isOpen = chatbot.style.display === "block";
    chatbot.style.display = isOpen ? "none" : "block";
    chatToggle.setAttribute("aria-expanded", String(!isOpen));
    // hide nudge once they interact
    hideNudge(true);
  });

  closeChat.addEventListener("click", () => {
    chatbot.style.display = "none";
    chatToggle.setAttribute("aria-expanded", "false");
  });

  /* ---------------- Send handlers ---------------- */
  sendBtn.addEventListener("click", async () => {
    sendMessage();
  });

  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    const userMessage = userInput.value;
    if (userMessage.trim()) {
      chatbotMessages.innerHTML += `<div class="message user-message">${userMessage}</div>`;
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      userInput.value = "";

      const loadingMessage = document.createElement("div");
      loadingMessage.className = "message bot-message loading";
      loadingMessage.innerText = "Loading...";
      chatbotMessages.appendChild(loadingMessage);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

      const answer = await getAnswer(userMessage);

      chatbotMessages.removeChild(loadingMessage);
      chatbotMessages.innerHTML += `<div class="message bot-message">${answer}</div>`;
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  }

  async function getAnswer(question) {
    try {
      const response = await fetch("https://personal-website-backend-six.vercel.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Sorry, I couldn't process that.";
    }
  }

  /* ---------------- Nudge logic ---------------- */
  // Show nudge after 4s if:
  // - chat is closed
  // - user hasn’t seen it before
  // - user hasn’t interacted with the page (optional: hover cancels)
  const nudgeDelayMs = 4000;
  let nudgeTimer = null;

  function scheduleNudge() {
    if (!chatNudge || localStorage.getItem(NUDGE_SEEN_KEY) === "1") return;
    if (chatbot.style.display === "block") return; // don't show if open
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => {
      chatNudge.classList.add("show");
    }, nudgeDelayMs);
  }

  function hideNudge(markSeen = false) {
    if (!chatNudge) return;
    chatNudge.classList.remove("show");
    clearTimeout(nudgeTimer);
    if (markSeen) localStorage.setItem(NUDGE_SEEN_KEY, "1");
  }

  // Hide nudge if they click it (nice UX)
  if (chatNudge) {
    chatNudge.addEventListener("click", () => {
      // Also open the chat on click of the bubble
      hideNudge(true);
      chatbot.style.display = "block";
      chatToggle.setAttribute("aria-expanded", "true");
    });
  }

  chatToggle.addEventListener("mouseenter", () => hideNudge(true));

  // Show on first load (with delay)
  scheduleNudge();

  closeChat.addEventListener("click", () => {
    if (localStorage.getItem(NUDGE_SEEN_KEY) !== "1") scheduleNudge();
  });
};
