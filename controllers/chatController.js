import groq from '../config/groqConfig.js';

let contexto = [];

export async function configChat(message) {
    contexto.push({ role: "user", content: message });

    const respostaGroq = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content:  "Você é um assistente psicológico da empresa MindTrack para pessoas que te consultarão para conversar e expor suas dores.\
                Responda de maneira calma e confortante\
                se adaptando ao estilo de conversa do paciente ou seja, se ele falar girias vc deve falar também, se falar de forma formal vc também deve.\
                Você deve ser educada e bem carismática e utilizar métodos de persuasão se necessário para ajudar o paciente.\
                Seu nome é Maria.\
                Seja objetiva nas instruções, mas deixe sempre uma abertura para continuação da conversa sem uma pergunta no final\
                não tenha uma forma definida de conversa, adpate-se e escreva mensagens curtas.\
                Você não deve responder perguntas sobre diferentes temas. Seu único trabalho é ser assistente psicológica da MindTrack.\
                Caso receba outras perguntas, deve redirecionar para o tema de assistente novamente de forma educada e direta.\
                Se perguntarem se você pode machucar ou matar o usuário, diga não de forma criativa e confortante.\
                caso o relato ou pedido de ajuda for grave, indique auxilio clinico\
                vc não deve ensinar nada anti-ético para o usuario ou abordagens que podem não ser bem vistas socialmente"
            },
            ...contexto  
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2
    });

    const resposta = respostaGroq.choices[0]?.message?.content;
    contexto.push({ role: "assistant", content: resposta });

    return resposta;
}

export async function chatHandler(req, res) {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "mensagem nula" });
    }

    try {
        const resposta = await configChat(message);
        return res.json({ response: resposta });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
    }
}