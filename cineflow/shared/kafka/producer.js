import createKafkaClient from './kafkaClient.js';

/**
 * Generic Kafka Producer helper.
 *
 * Usage:
 *   const producer = createProducer('booking-service');
 *   await producer.connect();
 *   await producer.publish('booking-initiated', { bookingId, userId, ... });
 *   await producer.disconnect();
 */
const createProducer = (clientId) => {
  const kafka = createKafkaClient(clientId);
  const producer = kafka.producer();

  const connect = async () => {
    await producer.connect();
    console.log(`[Kafka Producer] Connected (clientId: ${clientId})`);
  };

  /**
   * Publish a single JSON message to a topic.
   * @param {string} topic
   * @param {object} payload — will be JSON.stringify'd
   */
  const publish = async (topic, payload) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
    console.log(`[Kafka Producer] Published to "${topic}":`, payload);
  };

  const disconnect = async () => {
    await producer.disconnect();
  };

  return { connect, publish, disconnect };
};

export default createProducer;
