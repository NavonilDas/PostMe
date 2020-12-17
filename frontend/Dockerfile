FROM node:14.15-alpine3.11

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm","start"]