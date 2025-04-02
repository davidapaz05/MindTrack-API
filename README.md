MindTrack

MindTrack é uma aplicação web voltada para suporte emocional e orientação psicológica, utilizando um chatbot interativo e questionários personalizados para ajudar os usuários a refletirem sobre suas questões emocionais.

Funcionalidades

Chatbot Athena: Um assistente virtual que oferece suporte emocional e orientação psicológica.

Cadastro e Login: Sistema de autenticação para usuários.

Questionário Inicial: Personalização da experiência com base nas respostas do usuário.

Pontuação e Nível: Avaliação do bem-estar emocional do usuário com base nas respostas do questionário.

Pré-requisitos e Instalação

Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

Node.js (versão 16 ou superior)

Git

Um banco de dados PostgreSQL configurado

Instalação

Siga os passos abaixo para baixar e configurar o projeto:

1. Clone o repositório

Abra o terminal e execute o comando:

git clone <URL_DO_REPOSITORIO>
cd MindTrack

2. Instale as dependências

No diretório do projeto, execute:

npm install

Configuração e Inicialização

3. Configure as variáveis de ambiente

Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis:

PORT=3000
DB_USER=<seu_usuario>
DB_PASSWORD=<sua_senha>
DB_HOST=localhost
DATABASE=<nome_do_banco>
PORTA=5432
JWT_KEY=<sua_chave_secreta>
API_KEY=<sua_chave_da_api_groq>

Certifique-se de substituir <seu_usuario>, <sua_senha>, <nome_do_banco> e <sua_chave_secreta> pelos valores corretos.

4. Configure o banco de dados

Certifique-se de que o banco de dados PostgreSQL está configurado e contém as tabelas necessárias para o funcionamento do sistema. Caso precise criar as tabelas, utilize os scripts SQL fornecidos no projeto (se houver).

5. Inicie o servidor

Execute o comando:

npm start

O servidor será iniciado e estará disponível em http://localhost:3000.

Uso e Estrutura do Projeto

Uso

1. Cadastro

Acesse a página de registro (public/register.html) para criar uma conta.

Preencha os dados e envie o formulário.

2. Login

Acesse a página de login (public/login.html) para entrar na aplicação.

Insira suas credenciais.

3. Questionário Inicial

Após o login, responda ao questionário inicial para personalizar sua experiência.

4. Chatbot

Acesse a página de chat (public/chat.html) para interagir com o chatbot Athena.

5. Pontuação

Acesse a página inicial para visualizar sua pontuação e nível emocional.

Estrutura do Projeto

config/: Configurações do banco de dados e da API Groq.

controllers/: Lógica de negócio para autenticação, chat e questionários.

middlewares/: Middleware para autenticação JWT.

routes/: Rotas da API.

public/: Arquivos estáticos (HTML, CSS, JS).

styles/: Estilos CSS.

js/: Scripts de interação com a API.

Tecnologias, Contribuição e Licença

Tecnologias Utilizadas

Backend: Node.js, Express.js

Banco de Dados: PostgreSQL

Frontend: HTML, CSS, JavaScript

Autenticação: JWT

Chatbot: Groq SDK

Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

Licença

Este projeto está sob a licença MIT.