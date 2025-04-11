// Importa o pacote express para criar rotas
import express from 'express';
// Importa a função chatHandler do controlador de chat
import { chatHandler } from '../controllers/chatController.js';

// Cria uma instância do roteador do Express
const router = express.Router();

// Define a rota para lidar com requisições de chat, chamando a função chatHandler
router.post('/chat', chatHandler);




export default router;// Exporta o roteador para ser usado em outros arquivos