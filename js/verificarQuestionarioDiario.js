// Função para verificar se o questionário diário já foi respondido
export async function verificarQuestionarioDiario(userId, token) {
    console.log('Iniciando verificação do questionário para usuário:', userId);
    
    try {
        const response = await fetch(`http://localhost:3000/questionario/diario/verificar/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`Erro na verificação: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos do servidor:', data);
        
        if (!data.success) {
            console.error("Erro na resposta do servidor:", data.message);
            throw new Error(data.message || "Erro desconhecido no servidor");
        }
        
        const podeResponder = !data.ja_respondido;
        console.log('Usuário pode responder?', podeResponder);
        
        return podeResponder;
    } catch (error) {
        console.error("Erro ao verificar questionário diário:", error);
        // Em caso de erro, permitimos que o usuário tente responder
        // já que não conseguimos confirmar se ele já respondeu
        return true;
    }
} 