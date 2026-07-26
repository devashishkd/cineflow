FROM node:18-alpine
WORKDIR /app
COPY services/movie-service/package*.json ./
RUN npm install --production
COPY services/movie-service/ .
COPY shared/ /shared/
RUN ln -s /app/node_modules /shared/node_modules
EXPOSE 3002
CMD ["node", "index.js"]
