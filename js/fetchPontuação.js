// Adicione este evento para carregar a pontuação quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarPontuacao);

async function carregarPontuacao() {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !token) {
        document.getElementById("pontuacao").textContent = "Faça login para ver sua pontuação";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/questionario/pontuacao/${user.id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            const mensagem = `Sua pontuação: ${data.pontuacao_total} - Nível: ${data.nivel}`;
            document.getElementById("pontuacao").textContent = mensagem;
            
            // Adicione classes CSS conforme o nível (opcional)
            const elemento = document.getElementById("pontuacao");
            elemento.className = data.nivel.toLowerCase();
        } else {
            console.error("Erro ao buscar pontuação:", data.message);
            document.getElementById("pontuacao").textContent = "Erro ao carregar pontuação";
        }

    } catch (error) {
        console.error("Erro ao carregar pontuação:", error);
        document.getElementById("pontuacao").textContent = "Erro ao carregar pontuação";
    }
}