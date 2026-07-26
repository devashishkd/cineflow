import { Kafka } from 'kafkajs';

/**
 * Shared Kafka client factory.
 * Each service imports this and creates its own producer/consumer instances.
 *
 * KAFKA_BROKER env var should be set per service (e.g., "kafka:9092" in Docker).
 */
const createKafkaClient = (clientId) => {
  return new Kafka({
    clientId,
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    retry: {
      initialRetryTime: 300,
      retries: 10,
    },
  });
};

export default createKafkaClient;
