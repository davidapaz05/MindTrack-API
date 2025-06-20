# Usar imagem base
FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para o bcrypt
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências no ambiente de produção
RUN npm install --production

# Copiar o restante do código fonte
COPY . .

# Expor a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
