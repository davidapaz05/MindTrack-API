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

// CORS seguro
const allowedOrigins = [
  'https://mind-tracking.vercel.app',
   'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS não permitido'), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', chatRoutes);
app.use('/auth', authRoutes);
app.use('/questionario', questionarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
