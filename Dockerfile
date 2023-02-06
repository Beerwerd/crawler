FROM node:lts-alpine3.16
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

CMD npm run start
