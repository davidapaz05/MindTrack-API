// Importa o SDK da Groq para interagir com a API
import Groq from 'groq-sdk';
// Importa o pacote dotenv para carregar variáveis de ambiente de um arquivo .env
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env localizado na pasta config
dotenv.config({ path: "./config/.env" });

// Cria uma instância do cliente Groq usando a chave de API definida nas variáveis de ambiente
const groq = new Groq({ apiKey: process.env.API_KEY });

// Exporta a instância do cliente Groq para ser usada em outros arquivos
export default groq;