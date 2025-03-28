import express from 'express';
import { getPerguntas, salvarRespostas } from '../controllers/questionarioController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/perguntas', authenticate, getPerguntas);
router.post('/responder', authenticate, salvarRespostas);

export default router;