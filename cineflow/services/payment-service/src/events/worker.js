import createConsumer from '../../../../shared/kafka/consumer.js';
import createProducer from '../../../../shared/kafka/producer.js';
import paymentService from '../services/payment.service.js';

// Topics
const BOOKING_INITIATED = 'booking-initiated';
const PAYMENT_SUCCESS   = 'payment-success';
const PAYMENT_FAILED    = 'payment-failed';

/**
 * Payment Service Kafka Worker
 *
 * Listens to: "booking-initiated"
 * Publishes:  "payment-success" or "payment-failed"
 *
 * Flow:
 *   1. Consume booking-initiated event (contains bookingId, userId, amount)
 *   2. Run mock payment processor
 *   3. Publish result to the appropriate topic
 */
const startPaymentWorker = async () => {
  const producer = createProducer('payment-service-producer');
  await producer.connect();

  const consumer = createConsumer('payment-service-consumer', 'payment-group');

  await consumer.subscribe(BOOKING_INITIATED, async (topic, message) => {
    const payload = JSON.parse(message.value.toString());
    const { bookingId, userId, amount, seatIds, showId } = payload;

    console.log(`[Payment Worker] Processing payment for booking: ${bookingId}`);

    try {
      const { success, payment } = await paymentService.processPayment({
        bookingId,
        userId,
        amount,
      });

      if (success) {
        await producer.publish(PAYMENT_SUCCESS, {
          bookingId,
          userId,
          showId,
          seatIds,
          amount,
          transactionId: payment.transactionId,
        });
      } else {
        await producer.publish(PAYMENT_FAILED, {
          bookingId,
          userId,
          showId,
          seatIds,
          reason: payment.failureReason,
        });
      }
    } catch (err) {
      console.error('[Payment Worker] Unexpected error:', err.message);
      // Publish failure so booking-service can rollback
      await producer.publish(PAYMENT_FAILED, {
        bookingId,
        userId,
        showId,
        seatIds,
        reason: 'Internal payment error',
      }).catch(() => {});
    }
  });

  console.log('[Payment Worker] 🚀 Listening for booking-initiated events...');
};

export default startPaymentWorker;
