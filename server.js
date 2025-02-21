import express from 'express';
import Groq from 'groq-sdk'; 

const app = express();
app.use(express.json());

const port = 3000;

const groq = new Groq({ apiKey: "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" });

async function configChat(message) {
    return groq.chat.completions.create({
        messages:[
            {
                role: "system",
                content: "Você é um assistente psicologico da empresa MindTrack para pessoas que te consultarão para conversar e expor suas dores\
                Responda de maneira calma e confortante se adaptando para o estilo de conversa do paciente\
                vc deve ser educada e utilizar metodos de persuasão se nescessario para ajudar o paciente.\
                seu nome é Maria\
                seja objetiva nas instruções, mas deixe sempre uma boa abertura para continuação da conversa, porém fale menos\
                você não deve responder perguntas sobre diferentes temas, seu unico trabalho é assistente psicologica da mindtrack, caso vc receber outras perguntas deve redirecionar para o tema de assistente novamente de forma educada e direta.\
                se perguntarem se vc pode machucar ou matar o usuario diga não de forma criativa e confortante."
            },
            { 
                role: "user", 
                content: message 
            }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2
    });
}

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "mensagem nula" }); 
    }

    try {
        const respostaGroq = await configChat(message);
        return res.json({ response: respostaGroq.choices[0]?.message?.content });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});