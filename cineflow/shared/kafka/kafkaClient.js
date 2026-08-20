import { Kafka } from 'kafkajs';

/**
 * Shared Kafka client factory.
 * Each service imports this and creates its own producer/consumer instances.
 *
 * Local Docker : set KAFKA_BROKER=kafka:9092 (no auth needed)
 * Aiven Cloud  : set KAFKA_BROKER, KAFKA_USERNAME, KAFKA_PASSWORD (+ optionally KAFKA_CA_CERT)
 */
const createKafkaClient = (clientId) => {
  const brokers = [process.env.KAFKA_BROKER || 'localhost:9092'];

  const config = {
    clientId,
    brokers,
    retry: {
      initialRetryTime: 300,
      retries: 10,
    },
  };

  // Enable SASL + SSL when credentials are provided (Aiven / Confluent Cloud)
  if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
    // KAFKA_CA_CERT can be the raw PEM string (with \n escaped as \\n in the env var)
    config.ssl = process.env.KAFKA_CA_CERT
      ? { ca: [process.env.KAFKA_CA_CERT.replace(/\\n/g, '\n')] }
      : true; // true = use system CA store

    config.sasl = {
      mechanism: 'plain',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    };
  }

  return new Kafka(config);
};

export default createKafkaClient;
