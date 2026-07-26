import axios from 'axios';
import Booking from '../models/booking.model.js';
import seatLockService from './seatLock.service.js';
import createProducer from '../../../../shared/kafka/producer.js';

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';

// Singleton producer — connected once at startup (see index.js)
let producer = null;

export const initProducer = async () => {
  producer = createProducer('booking-service-producer');
  await producer.connect();
  console.log('[Booking Service] Kafka producer ready');
};

/**
 * Phase 3 Booking Flow (Async with Kafka):
 *
 * 1. LOCK seats in Redis (SET NX EX) — immediate rejection if any seat is taken
 * 2. Fetch show details from movie-service
 * 3. Validate seats belong to this show and are AVAILABLE
 * 4. Calculate total amount
 * 5. Create booking (status: PENDING)
 * 6. Publish "booking-initiated" to Kafka → payment-service picks this up
 * 7. Return PENDING booking to user immediately (async — no waiting for payment)
 *
 * Kafka consumer (consumer.js) handles the rest:
 *   payment-success → mark seats BOOKED, update booking to CONFIRMED, notify user
 *   payment-failed  → release Redis locks, update booking to FAILED, notify user
 */
const createBooking = async ({ userId, showId, seatIds }) => {
  // ── Step 1: Lock seats in Redis ────────────────────────────────────────
  await seatLockService.lockSeats(seatIds, userId);

  let booking = null;

  try {
    // ── Step 2: Get show + seats from movie-service ──────────────────────
    let show;
    try {
      const res = await axios.get(`${MOVIE_SERVICE_URL}/api/shows/${showId}`);
      show = res.data.data;
    } catch (err) {
      throw new Error('Could not fetch show details. Movie service may be unavailable.');
    }

    // ── Step 3: Validate seats ───────────────────────────────────────────
    const allShowSeatIds = show.seats.map((s) => s.id);
    const invalidSeats = seatIds.filter((id) => !allShowSeatIds.includes(id));
    if (invalidSeats.length > 0) {
      throw new Error(`Some seats do not belong to this show`);
    }

    const selectedSeats = show.seats.filter((s) => seatIds.includes(s.id));
    const unavailable = selectedSeats.filter((s) => s.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      const takenSeats = unavailable.map((s) => s.seatNumber).join(', ');
      throw new Error(`Seats already booked: ${takenSeats}`);
    }

    // ── Step 4: Calculate total amount ──────────────────────────────────
    const pricePerSeat = parseFloat(show.price);
    const totalAmount = pricePerSeat * selectedSeats.length;
    const seatNumbers = selectedSeats.map((s) => s.seatNumber);

    // ── Step 5: Create booking with PENDING status ───────────────────────
    booking = await Booking.create({
      userId,
      showId,
      seatIds,
      seatNumbers,
      totalAmount,
      status: 'PENDING',
    });

    // ── Step 6: Publish "booking-initiated" event to Kafka ───────────────
    // payment-service will consume this and process the payment asynchronously
    await producer.publish('booking-initiated', {
      bookingId: booking.id,
      userId,
      showId,
      seatIds,
      seatNumbers,
      amount: totalAmount,
    });

    // ── Step 7: Return PENDING booking immediately ───────────────────────
    // The user doesn't wait — they'll be notified when payment completes
    return booking;

  } catch (err) {
    // ── Rollback: release Redis locks on validation/DB failure ───────────
    await seatLockService.releaseSeats(seatIds);

    if (booking && booking.status === 'PENDING') {
      await booking.update({ status: 'FAILED' }).catch(() => {});
    }

    throw err;
  }
};

/**
 * Get a single booking — only returns if it belongs to the requesting user
 */
const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({ where: { id: bookingId, userId } });
  if (!booking) throw new Error('Booking not found');
  return booking;
};

/**
 * Get all bookings for the authenticated user
 */
const getUserBookings = async (userId) => {
  return Booking.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

export default { createBooking, getBookingById, getUserBookings };
