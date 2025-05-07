// Função para verificar se o questionário diário já foi respondido
export async function verificarQuestionarioDiario(userId, token) {
    try {
        const response = await fetch(`http://localhost:3000/questionario/diario/verificar/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return !data.ja_respondido; // Retorna true se NÃO respondeu (pode responder)
    } catch (error) {
        console.error("Erro ao verificar questionário diário:", error);
        return false;
    }
} 