import createProducer from '../../../../../shared/kafka/producer.js';

/**
 * Analytics channel — emits structured events to the `analytics-events` Kafka topic.
 *
 * A future analytics service can consume this topic to build dashboards,
 * funnel reports, and user behaviour insights.
 *
 * Event schema:
 * {
 *   event:     string   — e.g. "booking_confirmed", "booking_failed"
 *   userId:    string
 *   timestamp: string   — ISO 8601
 *   metadata:  object   — arbitrary event-specific fields
 * }
 */

const ANALYTICS_TOPIC = 'analytics-events';

let _producer = null;

const getProducer = async () => {
  if (_producer) return _producer;
  _producer = createProducer('notification-analytics');
  await _producer.connect();
  return _producer;
};

/**
 * Track an analytics event.
 * @param {{ event: string, userId: string, metadata?: object }} params
 */
const track = async ({ event, userId, metadata = {} }) => {
  try {
    const producer = await getProducer();
    await producer.publish(ANALYTICS_TOPIC, {
      event,
      userId,
      timestamp: new Date().toISOString(),
      metadata,
    });
    console.log(`[Analytics Channel] 📊 Tracked "${event}" for user ${userId}`);
  } catch (err) {
    // Analytics failures should never break the notification flow
    console.error(`[Analytics Channel] ⚠️  Failed to track "${event}":`, err.message);
  }
};

export default { track };
