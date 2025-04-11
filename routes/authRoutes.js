// Importa o pacote express para criar rotas
import express from 'express';
// Importa as funções de registro e login do controlador de autenticação
import { register, login } from '../controllers/authController.js';

// Cria uma instância do roteador do Express
const router = express.Router();

// Define a rota para registrar um novo usuário, chamando a função register
router.post('/register', register);
// Define a rota para realizar login, chamando a função login
router.post('/login', login);

// Exporta o roteador para ser usado em outros arquivos
export default router;
