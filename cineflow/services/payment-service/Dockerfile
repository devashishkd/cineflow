FROM node:18-alpine
WORKDIR /app
COPY services/payment-service/package*.json ./
RUN npm install --production
COPY services/payment-service/ .
COPY shared/ /shared/
RUN ln -s /app/node_modules /shared/node_modules
CMD ["node", "index.js"]
