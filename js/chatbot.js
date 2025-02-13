window.onload = function () {
    const sendBtn = document.getElementById("send-button");
    const userInput = document.getElementById("chat-input");
    const chatbotMessages = document.getElementById("chat-output");
    const chatToggle = document.getElementById("chat-toggle");
    const chatbot = document.getElementById("chatbot");
    const closeChat = document.getElementById("close-chat");

    if (!sendBtn || !userInput || !chatbotMessages || !chatToggle || !chatbot || !closeChat) {
        console.error("One or more chatbot elements are missing in the HTML.");
        return;
    }

    // Toggle chatbot visibility
    chatToggle.addEventListener("click", () => {
        chatbot.style.display = chatbot.style.display === "block" ? "none" : "block";
    });

    closeChat.addEventListener("click", () => {
        chatbot.style.display = "none";
    });

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

            const answer = await getAnswer(userMessage);
            chatbotMessages.innerHTML += `<div class="message bot-message">${answer}</div>`;
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }

    async function getAnswer(question) {
        try {
            const response = await fetch("http://127.0.0.1:5000/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error("Error fetching response:", error);
            return "Sorry, I couldn't process that.";
        }
    }
};
