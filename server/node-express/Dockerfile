FROM node:alpine

WORKDIR /usr/app

COPY . .
RUN npm install --production

CMD [ "npm", "start" ]