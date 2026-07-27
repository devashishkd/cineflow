import createConsumer from '../../../../shared/kafka/consumer.js';

// Topics
const BOOKING_INITIATED = 'booking-initiated';

/**
 * Payment Service Kafka Worker
 *
 * Listens to: "booking-initiated"
 *
 * Flow (with Razorpay integration):
 *   1. Consume booking-initiated event — just for logging/auditing
 *   2. Actual payment is handled via Razorpay checkout (frontend → /api/payments/create-order)
 *   3. After user pays, /api/payments/verify publishes "payment-success" or "payment-failed"
 */
const startPaymentWorker = async () => {
  const consumer = createConsumer('payment-service-consumer', 'payment-group');

  await consumer.subscribe(BOOKING_INITIATED, async (topic, message) => {
    const payload = JSON.parse(message.value.toString());
    const { bookingId, userId, amount, seatIds, showId } = payload;

    console.log(`[Payment Worker] Received booking-initiated for booking: ${bookingId}. Waiting for Razorpay payment...`);
    // With Razorpay integration, we no longer process mock payments here.
    // The payment will be verified via the /api/payments/verify endpoint which will publish payment-success or payment-failed.
  });

  console.log('[Payment Worker] 🚀 Listening for booking-initiated events...');
};

export default startPaymentWorker;
