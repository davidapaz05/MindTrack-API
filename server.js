import express from 'express';
import Groq from 'groq-sdk';
import cors from "cors";
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config({ path: `${dirname(fileURLToPath(import.meta.url))}/config/.env` });


const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const groq = new Groq({ apiKey: process.env.API_KEY });

const banco = new Pool({
    user: process.env.USER, 
    host: process.env.HOST, 
    database: process.env.DATABASE, 
    password: process.env.PASSWORD, 
    port: process.env.PORTA
});

banco.connect()
    .then(() => console.log("Banco de dados conectado!"))
    .catch(err => console.error("Erro ao conectar ao banco:", err));

let conversationHistory = [];  
async function configChat(message) {
    // Adiciona a nova mensagem do usuário ao histórico
    conversationHistory.push({
        role: "user",
        content: message
    });

    // Passa o histórico completo de mensagens para a IA, incluindo a última mensagem do usuário
    const respostaGroq = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "Você é um assistente psicológico da empresa MindTrack para pessoas que te consultarão para conversar e expor suas dores.\
                Responda de maneira calma e confortante, se adaptando ao estilo de conversa do paciente.\
                Você deve ser educada e utilizar métodos de persuasão se necessário para ajudar o paciente.\
                Seu nome é Maria.\
                Seja objetiva nas instruções, mas deixe sempre uma boa abertura para continuação da conversa, porém fale menos.\
                Você não deve responder perguntas sobre diferentes temas. Seu único trabalho é ser assistente psicológica da MindTrack.\
                Caso receba outras perguntas, deve redirecionar para o tema de assistente novamente de forma educada e direta.\
                Se perguntarem se você pode machucar ou matar o usuário, diga não de forma criativa e confortante.\
                caso o relato ou pedido de ajuda for grave, indique auxilio clinico",
            },
            ...conversationHistory  // Inclui o histórico de mensagens anteriores
    ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2
    });

    // Adiciona a resposta da IA ao histórico
    conversationHistory.push({
        role: "assistant",
        content: respostaGroq.choices[0]?.message?.content
    });

    return respostaGroq.choices[0]?.message?.content;
}

app.get('/register', (req, res) => res.sendFile(`${__dirname}/registro.html`));

app.get('/login', (req, res) => res.sendFile(`${__dirname}/login.html`));

app.post('/register', (req, res) => {
    const { nome, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).send('As senhas não coincidem');
    }

    const verificaExistenciaUser = 'SELECT * FROM usuarios WHERE nome = $1';
    banco.query(verificaExistenciaUser, [nome], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao verificar o usuário');
        }

        if (results.rows.length > 0) {
            return res.status(400).send('Nome de usuário já registrado');
        }

        const registroUser = 'INSERT INTO usuarios (nome, senha) VALUES ($1, $2)';
        banco.query(registroUser, [nome, senha], (err) => {
            if (err) {
                return res.status(500).send('Erro ao registrar o usuário');
            }
            res.json({ success: true, redirectUrl: '/pages/login.html' });
        });
    });
});


app.post('/login', (req, res) => {
    const { nome, senha } = req.body;

    const verificaExistenciaUser = 'SELECT * FROM usuarios WHERE nome = $1';
    banco.query(verificaExistenciaUser, [nome], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao buscar o usuário' });
        }

        if (results.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuário não encontrado' });
        }

        const user = results.rows[0];

        if (senha !== user.senha) {
            return res.status(400).json({ success: false, message: 'Senha incorreta' });
        }
        res.json({ success: true, redirectUrl: '/pages/chat.html' });
    });
});

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: "mensagem nula" });
    }

    try {
        const respostaGroq = await configChat(message);
        return res.json({ response: respostaGroq });
    } catch (error) {
        return res.status(500).send({ error: "Erro ao consultar a API da Groq." });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
