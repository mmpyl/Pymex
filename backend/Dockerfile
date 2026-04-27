FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Crear directorio de logs para evitar fallos en Winston
RUN mkdir -p logs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
