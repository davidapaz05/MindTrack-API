// Importa o pacote express para criar rotas
import express from 'express';
// Importa as funções do controlador de questionário
import { getPerguntas, salvarRespostas, getPontuacaoUsuario } from '../controllers/questionarioController.js';
// Importa o middleware de autenticação para proteger as rotas
import authenticate from '../middlewares/authenticate.js';

// Cria uma instância do roteador do Express
const router = express.Router();

// Define a rota para obter todas as perguntas e alternativas, protegida pelo middleware de autenticação
router.get('/perguntas', authenticate, getPerguntas);
// Define a rota para salvar as respostas do questionário, protegida pelo middleware de autenticação
router.post('/responder', authenticate, salvarRespostas);
// Define a rota para obter a pontuação total de um usuário, protegida pelo middleware de autenticação
router.get('/pontuacao/:usuario_id', authenticate, getPontuacaoUsuario);

// Exporta o roteador para ser usado em outros arquivos
export default router;