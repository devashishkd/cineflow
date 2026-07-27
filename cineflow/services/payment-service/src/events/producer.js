import createProducer from '../../../../shared/kafka/producer.js';

const producer = createProducer('payment-service-producer');

let isConnected = false;

export const getProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
  return producer;
};
