async function fetchData() {
    const response = await fetch('data.json');
    return response.json();
}

async function getResponse(userInput) {
    const data = await fetchData();
    userInput = userInput.toLowerCase();

    if (userInput.includes("name")) return `My name is ${data.name}.`;
    if (userInput.includes("skills")) return `My skills include: ${data.skills.join(", ")}.`;
    if (userInput.includes("experience")) {
        return `I have worked as ${data.experience[0].role} at ${data.experience[0].company} since ${data.experience[0].years}.`;
    }
    if (userInput.includes("projects")) {
        return `Here are some of my projects:\n${data.projects.map(p => `- ${p.name}: ${p.description} (${p.link})`).join("\n")}`;
    }

    return "I'm not sure how to answer that. Try asking about my skills, projects, or experience!";
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
