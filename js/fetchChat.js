async function sendMessage() {
    var userMessage = document.getElementById('user-message').value.trim();
    if (!userMessage) return; // Impede envio de mensagens vazias

    const chatBox = document.getElementById('chat-box');

    // Exibir a mensagem do usuário no chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.innerHTML = `<p>${userMessage}</p>`;
    chatBox.appendChild(userMessageDiv);

    // Limpar input
    document.getElementById('user-message').value = '';

    try {
        const response = await fetch('http://localhost:3000/api/chat', { // Ajuste a URL se necessário
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error('Erro ao conectar à API');
        }

        const data = await response.json();
        const botMessage = data.response || "Desculpe, houve um erro ao processar sua mensagem.";

        // Exibir resposta do bot
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message assistant';
        botMessageDiv.innerHTML = `<p>${botMessage}</p>`;
        chatBox.appendChild(botMessageDiv);

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'chat-message assistant';
        errorMessageDiv.innerHTML = `<p>Erro ao conectar com o servidor. Tente novamente mais tarde.</p>`;
        chatBox.appendChild(errorMessageDiv);
    }

    // Rolar para a última mensagem
    chatBox.scrollTop = chatBox.scrollHeight;
}