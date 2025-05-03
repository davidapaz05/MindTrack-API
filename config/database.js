// Importa o pacote 'pg' (PostgreSQL) para interagir com o banco de dados
import pkg from 'pg';
// Importa o pacote 'dotenv' para carregar variáveis de ambiente de um arquivo .env
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Desestrutura o objeto 'Pool' do pacote 'pg'
const { Pool } = pkg;

// Cria uma nova instância de Pool para gerenciar conexões com o banco de dados
const banco = new Pool({
    user: process.env.DB_USER, // Usuário do banco de dados (definido no .env)
    host: process.env.DB_HOST, // Host do banco de dados (definido no .env)
    database: process.env.DATABASE, // Nome do banco de dados (definido no .env)
    password: process.env.DB_PASSWORD, // Senha do banco de dados (definido no .env)
    port: process.env.PORTA // Porta do banco de dados (definido no .env)
});

// Tenta conectar ao banco de dados
banco.connect()
    .then(() => console.log("Banco de dados conectado!")) // Mensagem de sucesso ao conectar
    .catch(err => console.error("Erro ao conectar ao banco:", err)); // Mensagem de erro caso a conexão falhe

// Criação da tabela de questionários diários
banco.query(`
    CREATE TABLE IF NOT EXISTS questionarios_diarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        data_resposta DATE DEFAULT CURRENT_DATE,
        UNIQUE(usuario_id, data_resposta)
    );
`)
    .then(() => console.log("Tabela questionários_diarios criada com sucesso!"))
    .catch(err => console.error("Erro ao criar tabela questionários_diarios:", err));

// Exporta a instância do banco para ser usada em outros arquivos
export default banco;