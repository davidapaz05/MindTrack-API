// Importa o pacote express para criar rotas
import express from 'express';
// Importa as funções do controlador de questionário
import { getPerguntas, salvarRespostas, getPontuacaoUsuario, getHistoricoQuestionarios, getEstatisticasUsuario } from '../controllers/questionarioController.js';
// Importa as funções do controlador de questionário diário
import { verificarQuestionarioDiario, getPerguntasDiarias, salvarRespostasDiarias } from '../controllers/questionarioDiarioController.js';
// Importa o middleware de autenticação para proteger as rotas
import authenticate from '../middlewares/authenticate.js';

// Cria uma instância do roteador do Express
const router = express.Router();

// Rotas do questionário inicial
router.get('/perguntas', authenticate, getPerguntas);
router.post('/responder', authenticate, salvarRespostas);
router.get('/pontuacao/:usuario_id', authenticate, getPontuacaoUsuario);
router.get('/historico/:usuario_id', authenticate, getHistoricoQuestionarios);
router.get('/estatisticas/:usuario_id', authenticate, getEstatisticasUsuario);
// Rotas do questionário diário
router.get('/diario/verificar/:usuario_id', authenticate, verificarQuestionarioDiario);
router.get('/diario/perguntas', authenticate, getPerguntasDiarias);
router.post('/diario/responder', authenticate, salvarRespostasDiarias);

// Exporta o roteador para ser usado em outros arquivos
export default router;