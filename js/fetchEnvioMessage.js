async function sendMessage() {
    const input = document.getElementById("message-input");
    const messagesDiv = document.getElementById("messages");

    if (!input.value.trim()) return;

    // Cria a mensagem do usuário
    const userMessage = document.createElement("div");
    userMessage.textContent = input.value;
    userMessage.classList.add("message", "user");
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
        console.log("Resposta recebida:", data);

        const botMessage = document.createElement("div");
        botMessage.textContent = data.response || "Erro ao obter resposta"; 
        botMessage.classList.add("message", "bot");
        messagesDiv.appendChild(botMessage);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Erro: Não foi possível obter resposta.";
        errorMessage.classList.add("message", "bot"); 
        messagesDiv.appendChild(errorMessage);
    }

    input.value = "";
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}