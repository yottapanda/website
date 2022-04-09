FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV PRODUCTION=true

EXPOSE 80
CMD [ "node", "server.js" ]
