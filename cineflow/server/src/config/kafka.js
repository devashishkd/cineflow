import { Kafka } from 'kafkajs';

/**
 * Kafka client factory.
 * Used only for the analytics-events topic.
 * Returns null if KAFKA_BROKER is not configured (analytics degrades gracefully).
 */
export const createKafkaClient = (clientId) => {
  const broker = process.env.KAFKA_BROKER;
  if (!broker) return null;

  const config = {
    clientId,
    brokers: [broker],
    retry: { initialRetryTime: 300, retries: 10 },
  };

  if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
    config.ssl = process.env.KAFKA_CA_CERT
      ? { ca: [process.env.KAFKA_CA_CERT.replace(/\\n/g, '\n')] }
      : true;

    config.sasl = {
      mechanism: 'plain',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    };
  }

  return new Kafka(config);
};

export default createKafkaClient;
