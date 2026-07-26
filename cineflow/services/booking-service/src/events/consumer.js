import axios from 'axios';
import createConsumer from '../../../../shared/kafka/consumer.js';
import createProducer from '../../../../shared/kafka/producer.js';
import Booking from '../models/booking.model.js';
import seatLockService from '../services/seatLock.service.js';

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';

const PAYMENT_SUCCESS   = 'payment-success';
const PAYMENT_FAILED    = 'payment-failed';
const BOOKING_CONFIRMED = 'booking-confirmed';

/**
 * Booking Service Kafka Consumer
 *
 * Listens to: "payment-success" → confirm booking, update seats, notify user
 * Listens to: "payment-failed"  → fail booking, release seats + Redis locks
 */
const startBookingConsumer = async () => {
  const notifyProducer = createProducer('booking-service-notify-producer');
  await notifyProducer.connect();

  const consumer = createConsumer('booking-service-consumer', 'booking-group');

  await consumer.subscribe(
    [PAYMENT_SUCCESS, PAYMENT_FAILED],
    async (topic, message) => {
      const payload = JSON.parse(message.value.toString());
      const { bookingId, userId, showId, seatIds, seatNumbers, transactionId, reason } = payload;

      if (topic === PAYMENT_SUCCESS) {
        // ── Payment succeeded: confirm booking & update seats ────────────
        try {
          // 1. Update booking status to CONFIRMED
          await Booking.update({ status: 'CONFIRMED' }, { where: { id: bookingId } });
          console.log(`[Booking Consumer] ✅ Booking ${bookingId} CONFIRMED`);

          // 2. Mark seats BOOKED in movie-service
          try {
            await axios.put(`${MOVIE_SERVICE_URL}/api/shows/seats/update-status`, {
              seatIds,
              status: 'BOOKED',
            });
          } catch (err) {
            console.error('[Booking Consumer] Failed to update seats in movie-service:', err.message);
            // Non-fatal — seats have TTL lock anyway; log for manual review
          }

          // 3. Release Redis seat locks (seats are now BOOKED in DB)
          await seatLockService.releaseSeats(seatIds);

          // 4. Publish booking-confirmed for notification-service
          await notifyProducer.publish(BOOKING_CONFIRMED, {
            bookingId,
            userId,
            showId,
            seatIds,
            seatNumbers,
            transactionId,
          });
        } catch (err) {
          console.error(`[Booking Consumer] Error confirming booking ${bookingId}:`, err.message);
        }

      } else if (topic === PAYMENT_FAILED) {
        // ── Payment failed: rollback booking & release seat locks ─────────
        try {
          // 1. Mark booking as FAILED
          await Booking.update({ status: 'FAILED' }, { where: { id: bookingId } });
          console.log(`[Booking Consumer] ❌ Booking ${bookingId} FAILED — ${reason}`);

          // 2. Release Redis locks so other users can book these seats
          await seatLockService.releaseSeats(seatIds);
        } catch (err) {
          console.error(`[Booking Consumer] Error failing booking ${bookingId}:`, err.message);
        }
      }
    }
  );

  console.log('[Booking Consumer] 🚀 Listening for payment-success and payment-failed events...');
};

export default startBookingConsumer;
