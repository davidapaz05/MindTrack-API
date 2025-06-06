# MindTrack

MindTrack é uma aplicação web voltada para suporte emocional e orientação psicológica, utilizando um chatbot interativo e questionários personalizados para ajudar os usuários a refletirem sobre suas questões emocionais.

## ✨ Funcionalidades

- **Chatbot Athena**: Assistente virtual que oferece suporte emocional e orientação psicológica.
- **Cadastro e Login**: Sistema de autenticação seguro para usuários.
- **Questionário Inicial**: Personaliza a experiência do usuário com base nas respostas fornecidas.
- **Pontuação e Nível**: Avaliação do bem-estar emocional do usuário a partir dos questionários.

---

## 🛠️ Instalação e Configuração

### ⚡ Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) devidamente configurado

### 🔧 Instalação

1. **Clone o repositório**

   ```sh
   git clone <URL_DO_REPOSITORIO>
   cd MindTrack
   ```

2. **Instale as dependências**

   ```sh
   npm install
   ```

### 🌐 Configuração e Inicialização

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

   ```env
   PORT=3000
   DB_USER=<seu_usuario>
   DB_PASSWORD=<sua_senha>
   DB_HOST=localhost
   DATABASE=<nome_do_banco>
   PORTA=5432
   JWT_KEY=<sua_chave_secreta>
   API_KEY=<sua_chave_da_api_groq>
   ```

   Substitua `<seu_usuario>`, `<sua_senha>`, `<nome_do_banco>` e `<sua_chave_secreta>` pelos valores corretos.

4. **Configure o banco de dados**

   Certifique-se de que o PostgreSQL está rodando e que o banco de dados possui as tabelas necessárias. Caso precise criá-las, utilize os scripts SQL fornecidos no projeto.

5. **Inicie o servidor**

   ```sh
   npm start
   ```

   O servidor será iniciado e estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 📚 Uso

1. **Cadastro**
   - Acesse `public/register.html` para criar uma conta.
   - Preencha os dados e envie o formulário.

2. **Login**
   - Acesse `public/login.html` e insira suas credenciais.

3. **Questionário Inicial**
   - Responda ao questionário para personalizar sua experiência.

4. **Chatbot Athena**
   - Acesse `public/chat.html` para interagir com o chatbot.

5. **Pontuação**
   - Visualize sua pontuação e nível emocional na página inicial.

---

## 🌐 Estrutura do Projeto

```
MindTrack/
├── config/          # Configurações do banco de dados e da API Groq
├── controllers/     # Lógica de negócio (autenticação, chat, questionários)
├── middlewares/     # Middleware para autenticação JWT
├── routes/          # Rotas da API
└── server.js        # Arquivo principal do servidor
```

---

## 💻 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Chatbot**: Groq SDK

---

## 🚀 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma nova branch (`git checkout -b minha-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para o repositório remoto (`git push origin minha-feature`)
5. Abra um Pull Request

---

## 📚 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
