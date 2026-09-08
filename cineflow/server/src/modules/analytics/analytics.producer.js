/**
 * analytics.producer.js — No-op stub (Kafka removed)
 *
 * All publish calls are silently dropped.
 * Re-wire this to a real Kafka producer when Kafka is re-added.
 */

const noOpProducer = {
  publish: async () => {},
};

export const getAnalyticsProducer = async () => noOpProducer;

export default { getAnalyticsProducer };
