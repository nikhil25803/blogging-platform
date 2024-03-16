FROM node:current-alpine3.19

WORKDIR /usr/src/app

RUN npm install -g prisma

COPY package*.json ./

RUN npm ci 

COPY . .

RUN prisma generate

RUN npx prisma migrate dev --name init

EXPOSE 8000

CMD ["node", "index.js"]
