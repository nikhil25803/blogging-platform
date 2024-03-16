FROM node:current-alpine3.19

WORKDIR /usr/src/app

# Install Prisma
RUN npm install -g prisma

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci 

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8000

CMD [ "npm", "run", "start:migrate:prod" ]
