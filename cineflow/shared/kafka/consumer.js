import createKafkaClient from './kafkaClient.js';

/**
 * Generic Kafka Consumer helper.
 *
 * Usage:
 *   const consumer = createConsumer('payment-service', 'payment-group');
 *   await consumer.subscribe('booking-initiated', async (message) => {
 *     const payload = JSON.parse(message.value.toString());
 *     // handle the event...
 *   });
 */
const createConsumer = (clientId, groupId) => {
  const kafka = createKafkaClient(clientId);
  const consumer = kafka.consumer({ groupId });

  /**
   * Subscribe to one or more topics and register a handler.
   * Automatically connects and starts consuming.
   *
   * @param {string|string[]} topics
   * @param {function} handler - async (message) => void
   */
  const subscribe = async (topics, handler) => {
    await consumer.connect();
    console.log(`[Kafka Consumer] Connected (clientId: ${clientId}, groupId: ${groupId})`);

    const topicList = Array.isArray(topics) ? topics : [topics];
    for (const topic of topicList) {
      await consumer.subscribe({ topic, fromBeginning: false });
      console.log(`[Kafka Consumer] Subscribed to "${topic}"`);
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`[Kafka Consumer] Received from "${topic}":`, message.value.toString());
        try {
          await handler(topic, message);
        } catch (err) {
          console.error(`[Kafka Consumer] Error handling message from "${topic}":`, err.message);
        }
      },
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { subscribe, disconnect };
};

export default createConsumer;
