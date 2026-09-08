import { getAnalyticsProducer } from './analytics.producer.js';

/**
 * Analytics Service
 *
 * Thin wrapper that publishes structured analytics events via Kafka.
 * Failures are swallowed — analytics should never break the booking flow.
 */

const track = async (event, userId, metadata = {}) => {
  try {
    const producer = await getAnalyticsProducer();
    if (!producer) return;
    await producer.publish(event, userId, metadata);
  } catch (err) {
    console.warn(`[Analytics] ⚠️  Failed to track "${event}":`, err.message);
  }
};

export const trackBookingConfirmed = async ({ userId, bookingId, showId, seatNumbers, transactionId }) => {
  await track('booking_confirmed', userId, { bookingId, showId, seatNumbers, transactionId });
};

export const trackBookingFailure = async ({ userId, bookingId, reason }) => {
  await track('booking_failed', userId, { bookingId, reason });
};

export default { trackBookingConfirmed, trackBookingFailure };
