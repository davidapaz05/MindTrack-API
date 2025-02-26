async function sendMessage() {
    const input = document.getElementById("message-input");
    const messagesDiv = document.getElementById("messages");

    if (!input.value.trim()) return;

    // Cria a mensagem do usuário
    const userMessage = document.createElement("div");
    userMessage.textContent = input.value; // Removi "Você: " para manter o layout limpo
    userMessage.classList.add("message", "user"); // Adiciona as classes
    messagesDiv.appendChild(userMessage);

    try {
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input.value })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resposta recebida:", data); // 🔹 Log para debug

        // Cria a mensagem do bot
        const botMessage = document.createElement("div");
        botMessage.textContent = data.response || "Erro ao obter resposta"; // Removi "Maria: " para manter o layout limpo
        botMessage.classList.add("message", "bot"); // Adiciona as classes
        messagesDiv.appendChild(botMessage);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Erro: Não foi possível obter resposta.";
        errorMessage.classList.add("message", "bot"); // Adiciona as classes
        messagesDiv.appendChild(errorMessage);
    }

    input.value = "";
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}