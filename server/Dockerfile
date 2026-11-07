FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci --omit=dev --workspace server

COPY server ./server

WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "run", "start"]
