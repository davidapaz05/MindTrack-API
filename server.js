import express from 'express'; 
import cors from 'cors';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import questionarioRoutes from './routes/questionarioRoutes.js'; 

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static("public"));

app.use('/api', chatRoutes);
app.use('/auth', authRoutes);
app.use('/questionario', questionarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});