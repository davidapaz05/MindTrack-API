import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const banco = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST, 
    database: process.env.DATABASE, 
    password: process.env.DB_PASSWORD, 
    port: process.env.PORTA
});

banco.connect()
    .then(() => console.log("Banco de dados conectado!"))
    .catch(err => console.error("Erro ao conectar ao banco:", err));

export default banco;