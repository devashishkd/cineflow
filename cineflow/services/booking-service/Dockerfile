FROM node:18-alpine
WORKDIR /app
COPY services/booking-service/package*.json ./
RUN npm install --production
COPY services/booking-service/ .
COPY shared/ /shared/
RUN ln -s /app/node_modules /shared/node_modules
EXPOSE 3003
CMD ["node", "index.js"]
