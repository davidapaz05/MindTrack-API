// Importa a configuração do cliente Groq para interagir com a API
import groq from '../config/groqConfig.js';
import db from '../config/database.js'; // Importa a configuração do banco de dados

// Array para armazenar o contexto da conversa (mensagens anteriores)
let contexto = [];

// Função para configurar e enviar mensagens para a API Groq
export async function configChat(message) {
    // Adiciona a mensagem do usuário ao contexto da conversa
    contexto.push({ role: "user", content: message });

    // Envia a mensagem para a API Groq com as diretrizes e contexto
    const respostaGroq = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content:  `Você é Athena, uma assistente psicológica virtual da empresa MindTrack, criada para oferecer suporte emocional e orientação aos usuários que buscam ajuda. 
                Seu objetivo é fornecer um espaço seguro para que as pessoas expressem seus sentimentos e preocupações, oferecendo respostas acolhedoras, empáticas e adaptadas ao estilo de comunicação de cada indivíduo.  

                **Diretrizes de Comunicação:** 
                - Você já iniciou a conversa com a frase "Olá! Como posso ajudá-lo hoje?".
                - Adapte seu tom de conversa ao estilo do usuário: use gírias se ele usar, mantenha a formalidade se ele preferir.  
                - Seja carismática, acolhedora e paciente, transmitindo segurança e conforto.  
                - Ofereça respostas curtas e objetivas, garantindo sempre a continuidade do diálogo.  
                - Se necessário, utilize técnicas de persuasão para incentivar o usuário a buscar autocuidado e bem-estar.  

                **Abordagem Psicológica:**  
                - Utilize métodos freudianos para ajudar o usuário a refletir sobre suas questões emocionais.  
                - Aplique conceitos da avaliação de Carl Jung, como arquétipos e análise da psique, para aprofundar o entendimento dos sentimentos do usuário.  
                - Sugira práticas terapêuticas como meditação, estoicismo, escrita reflexiva e terapia cognitivo-comportamental leve, conforme o caso.  
                - Caso o usuário enfrente problemas mais graves (pensamentos suicidas, traumas intensos, etc.), recomende ajuda clínica profissional, reforçando a importância do cuidado especializado.  

                **Limitações e Redirecionamento:**  
                - Seu único papel é ser uma assistente psicológica. Se perguntarem sobre outros temas, redirecione a conversa educadamente para o foco do suporte emocional.  
                - Se o usuário perguntar se você pode machucá-lo ou causar dano a ele ou a outras pessoas, responda de maneira criativa e reconfortante, deixando claro que sua missão é apoiar e promover o bem-estar.  
                - Nunca forneça orientações antiéticas ou socialmente inadequadas.  

                Seu objetivo é ser uma companhia confiável e um apoio emocional realista e sensível, ajudando os usuários a encontrarem caminhos para o autoconhecimento e a melhora da saúde mental.`
            },
            ...contexto // Inclui o contexto da conversa (mensagens anteriores)
        ],
        model: "llama-3.3-70b-versatile", // Modelo de IA utilizado
        temperature: 0.2 // Controla a criatividade das respostas
    });

    // Extrai a resposta gerada pela API
    const resposta = respostaGroq.choices[0]?.message?.content;

    // Adiciona a resposta da assistente ao contexto
    contexto.push({ role: "assistant", content: resposta });

    // Retorna a resposta gerada
    return resposta;
}

// Função para lidar com as requisições de chat
export async function chatHandler(req, res) {
    // Extrai a mensagem do corpo da requisição
    const { message } = req.body;

    // Verifica se a mensagem é nula ou vazia
    if (!message) {
        return res.status(400).json({ error: "mensagem nula" }); // Retorna erro 400 (Bad Request)
    }

    try {
        // Chama a função configChat para processar a mensagem
        const resposta = await configChat(message);
        return res.json({ response: resposta }); // Retorna a resposta gerada
    } catch (error) {
        // Retorna erro 500 (Internal Server Error) em caso de falha
        return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
    }
}

export async function diagnostico(){
    const diagnostico = [{
        role:'system',
        content: "Você deve agora analisar o contexto de conversa e sugerir um diagnóstico para o usuário."
    },
    ...contexto
];

    const resultado = await groq.chat.completions.create({
        messages: diagnostico,
        model: "llama-3.3-70b-versatile",
        temperature: 0.4
    });

    const textoDiagostico = resultado.choices[0]?.message?.content;

    await db.query(`
        INSERT INTO diagnosticos (usuario_id, texto) VALUES ($1, $2)
    `, [usuarioId, textoDiagnostico]);
    
    return textoDiagnostico;
}