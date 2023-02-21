FROM node:18.12-alpine
ENV NODE_ENV dev

WORKDIR /server

COPY ../../server/package.json .
COPY ../../server/package-lock.json .

COPY ../../server/ .

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]