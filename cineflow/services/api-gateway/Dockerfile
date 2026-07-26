FROM node:18-alpine
WORKDIR /app
COPY services/api-gateway/package*.json ./
RUN npm install --production
COPY services/api-gateway/ .
COPY shared/ /shared/
RUN ln -s /app/node_modules /shared/node_modules
EXPOSE 3000
CMD ["node", "index.js"]
