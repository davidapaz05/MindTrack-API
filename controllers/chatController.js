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
                - Ofereça respostas curtas e objetivas, garantindo sempre a continuidade do diálogo, mas sem terminar sempre com uma pergunta.  
                - Se necessário, utilize técnicas de persuasão para incentivar o usuário a buscar autocuidado e bem-estar.  
                - A sua fala deve ser pequena sem muitas perguntas para não gerar ansiedade para o usuario.

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
    const { message } = req.body;
    const usuarioId = req.user?.id; // Supondo que o ID esteja vindo do token JWT decodificado via middleware

    if (!message) {
        return res.status(400).json({ error: "mensagem nula" });
    }

    try {
        const resposta = await configChat(message);
        console.log("Contexto atual:", contexto.length);
        console.log("Usuário ID:", usuarioId);
        // Se o contexto tiver mais de 25 interações, gera o diagnóstico:
        if (contexto.length >= 10 && usuarioId) {
            await diagnostico(usuarioId);
            // você pode limpar o contexto depois, se quiser começar uma nova "sessão"
            contexto = [];
        }

        return res.json({ response: resposta });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
    }
}

export async function diagnostico(usuarioId) {
    // Filtra apenas as falas do usuário
    const mensagensDoUsuario = contexto.filter(msg => msg.role === "user");

    // Junta as mensagens em um único texto para análise
    const falas = mensagensDoUsuario.map((msg, i) => `(${i + 1}) ${msg.content}`).join("\n");

const prompt = `
Você é Athena, uma assistente psicológica virtual da empresa MindTrack.

Com base nas falas a seguir, escreva um **diagnóstico emocional objetivo e empático**, com **no máximo 50 palavras**. Em seguida, forneça **uma dica prática de bem-estar** que possa ajudar o usuário a lidar melhor com a situação.

Falas do usuário:
${falas}

Formato da resposta:
Diagnóstico: [máx. 50 palavras]  
Dica: [uma sugestão simples, personalizada e acolhedora]
`;

    const resultado = await groq.chat.completions.create({
        messages: [
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.4
    });

    const textoDiagnostico = resultado.choices[0]?.message?.content?.trim();

    if (!textoDiagnostico) {
        console.warn("Diagnóstico não gerado. Verifique o conteúdo retornado da IA.");
        return "Diagnóstico não gerado. Verifique o conteúdo retornado da IA.";
    }

    console.log("Texto do diagnóstico gerado:\n", textoDiagnostico);

    await db.query(`
        INSERT INTO diagnosticos (usuario_id, texto) VALUES ($1, $2)
    `, [usuarioId, textoDiagnostico]);

    return textoDiagnostico;
}
export async function gerarDicaDiagnostico(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    try {
        // Pega o diagnóstico mais recente do usuário
        const { rows } = await db.query(`
            SELECT texto FROM diagnosticos 
            WHERE usuario_id = $1 
            ORDER BY id DESC 
            LIMIT 1
        `, [usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum diagnóstico encontrado para este usuário.' });
        }

        const textoDiagnostico = rows[0].texto;

        const prompt = `
Você é Athena, uma assistente psicológica da MindTrack.

Com base no seguinte diagnóstico emocional, gere **apenas uma dica prática, acolhedora e personalizada**, com **no máximo 30 palavras**, que ajude o usuário a lidar melhor com sua situação:

Diagnóstico:
${textoDiagnostico}

Formato da resposta:
Dica: [texto da dica]
        `;

        const respostaIA = await groq.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5
        });

        const dica = respostaIA.choices[0]?.message?.content?.trim();

        if (!dica) {
            return res.status(500).json({ error: 'Não foi possível gerar a dica.' });
        }

        return res.json({ dica });

    } catch (err) {
        console.error("Erro ao gerar dica:", err);
        return res.status(500).json({ error: 'Erro interno ao gerar dica.' });
    }
}
