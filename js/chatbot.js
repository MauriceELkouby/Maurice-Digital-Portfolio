async function getResponse(userInput) {
    try {
        const response = await fetch('https://portfolio.mokoolb.workers.dev/', {
            method: 'POST', // Ensure this is POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userInput }) // Ensure this is a JSON object
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.answer;
    } catch (error) {
        console.error("Error fetching response:", error);
        return "Error processing your request.";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const chatOutput = document.getElementById("chat-output");
    const sendButton = document.getElementById("send-button");

    sendButton.addEventListener("click", async function () {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatOutput.innerHTML += `<div class="chat-message user">${userMessage}</div>`;
        chatInput.value = "";

        const botResponse = await getResponse(userMessage);
        chatOutput.innerHTML += `<div class="chat-message bot">${botResponse}</div>`;
        chatOutput.scrollTop = chatOutput.scrollHeight;
    });
});
