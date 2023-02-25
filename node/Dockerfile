FROM node:18.12-alpine
# ENV NODE_ENV dev

WORKDIR /server

COPY ../server/package.json .
COPY ../server/package-lock.json .

# RUN npm cache clean --force && rm -rf node_modules && npm install
RUN npm install

COPY ../server/ .

EXPOSE 5000

CMD ["npm", "start"]