import express from 'express';
import { getPerguntas, salvarRespostas, getPontuacaoUsuario } from '../controllers/questionarioController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/perguntas', authenticate, getPerguntas);
router.post('/responder', authenticate, salvarRespostas);
router.get('/pontuacao/:usuario_id', authenticate, getPontuacaoUsuario);

export default router;