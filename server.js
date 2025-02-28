import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Rotas estáticas para páginas HTML
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'registro.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'login.html')));

// Rotas da API
app.use('/api', chatRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});