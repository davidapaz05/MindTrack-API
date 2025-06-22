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

const allowedOrigins = [
    'https://mind-tracking.vercel.app', // Vercel
    'http://localhost:5137',           // Sua máquina local
    'http://127.0.0.1:5137',           // Outra forma local (IP)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem origin (ex: mobile, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

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
