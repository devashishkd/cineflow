import axios from 'axios';
import Booking from '../models/booking.model.js';
import seatLockService from './seatLock.service.js';

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';

/**
 * Phase 2 Booking Flow (with Redis seat locking):
 *
 * 1. LOCK seats in Redis (SET NX EX) — immediate rejection if any seat is taken
 * 2. Fetch show details from movie-service (includes all seats)
 * 3. Validate that selected seats belong to this show and are AVAILABLE in DB
 * 4. Calculate total amount
 * 5. Create booking (status: PENDING)
 * 6. Call movie-service to mark seats as BOOKED in DB
 * 7. Confirm booking (status: CONFIRMED)
 * 8. Release Redis locks (locks are now redundant — seats are BOOKED in DB)
 *
 * On any error after step 1:
 *   - Release Redis locks (step 1 rollback)
 *   - Mark booking as FAILED if it was created (step 5 rollback)
 *
 * Race condition prevention:
 *   - Two simultaneous requests for the same seat → only one SET NX EX wins
 *   - The loser gets an immediate 400 error before any DB write
 */
const createBooking = async ({ userId, showId, seatIds }) => {
  // ── Step 1: Lock seats in Redis ────────────────────────────────────────
  // This is the critical section. Only one user wins the lock per seat.
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

    // ── Step 3: Validate seats belong to this show and are AVAILABLE in DB
    // Note: Redis lock prevents race conditions, but we still validate DB state
    // to guard against seats that were already BOOKED before this request.
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

    // ── Step 6: Mark seats as BOOKED in movie-service ───────────────────
    try {
      await axios.put(`${MOVIE_SERVICE_URL}/api/shows/seats/update-status`, {
        seatIds,
        status: 'BOOKED',
      });
    } catch (err) {
      // Rollback: mark booking as FAILED if seat update fails
      await booking.update({ status: 'FAILED' });
      throw new Error('Failed to reserve seats. Please try again.');
    }

    // ── Step 7: Confirm booking ──────────────────────────────────────────
    await booking.update({ status: 'CONFIRMED' });

    // ── Step 8: Release Redis locks ──────────────────────────────────────
    // Seats are now BOOKED in DB — the Redis lock is redundant but we clean up
    await seatLockService.releaseSeats(seatIds);

    return booking;
  } catch (err) {
    // ── Rollback: release Redis locks on any failure ─────────────────────
    await seatLockService.releaseSeats(seatIds);

    // If booking was created but something downstream failed, mark it FAILED
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
