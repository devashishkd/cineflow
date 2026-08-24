import Booking from './booking.model.js';
import seatLockService from './seat-lock.service.js';
import showService from '../shows/show.service.js';

/**
 * Create a booking.
 *
 * Monolith flow (synchronous, no Kafka):
 *   1. Lock seats in Redis (atomic SET NX EX)
 *   2. Fetch show details directly via showService (no HTTP)
 *   3. Validate seats belong to show and are AVAILABLE
 *   4. Calculate total amount
 *   5. Create PENDING booking and return it
 *
 * Payment confirmation (PENDING → CONFIRMED) happens in payment.controller
 * after Razorpay webhook verification.
 */
export const createBooking = async ({ userId, showId, seatIds }) => {
  // ── Step 1: Lock seats ────────────────────────────────────────────────────
  await seatLockService.lockSeats(seatIds, userId);

  let booking = null;

  try {
    // ── Step 2: Get show + seats directly (no HTTP) ───────────────────────
    const show = await showService.getShowById(showId);

    // ── Step 3: Validate seats ────────────────────────────────────────────
    const allShowSeatIds = show.seats.map((s) => s.id);
    const invalidSeats   = seatIds.filter((id) => !allShowSeatIds.includes(id));
    if (invalidSeats.length > 0) throw new Error('Some seats do not belong to this show');

    const selectedSeats = show.seats.filter((s) => seatIds.includes(s.id));
    const unavailable   = selectedSeats.filter((s) => s.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      const taken = unavailable.map((s) => s.seatNumber).join(', ');
      throw new Error(`Seats already booked: ${taken}`);
    }

    // ── Step 4: Calculate amount ──────────────────────────────────────────
    const pricePerSeat  = parseFloat(show.price);
    const totalAmount   = pricePerSeat * selectedSeats.length;
    const seatNumbers   = selectedSeats.map((s) => s.seatNumber);

    // ── Step 5: Create PENDING booking ────────────────────────────────────
    booking = await Booking.create({ userId, showId, seatIds, seatNumbers, totalAmount, status: 'PENDING' });

    return booking;

  } catch (err) {
    await seatLockService.releaseSeats(seatIds);
    if (booking) await booking.update({ status: 'FAILED' }).catch(() => {});
    throw err;
  }
};

/**
 * Confirm a booking after successful payment.
 * Called directly by payment.controller (replaces Kafka payment-success event).
 */
export const confirmBooking = async (bookingId) => {
  await Booking.update({ status: 'CONFIRMED' }, { where: { id: bookingId } });
  console.log(`[Booking] ✅ Booking ${bookingId} CONFIRMED`);
};

/**
 * Mark a booking as failed after payment failure.
 */
export const failBooking = async (bookingId) => {
  await Booking.update({ status: 'FAILED' }, { where: { id: bookingId } });
  console.log(`[Booking] ❌ Booking ${bookingId} FAILED`);
};

/**
 * Get a single booking (owned by userId). Enriched with show details.
 */
export const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({ where: { id: bookingId, userId } });
  if (!booking) throw new Error('Booking not found');

  // Enrich with show details (direct function call — no HTTP)
  try {
    const show = await showService.getShowById(booking.showId);
    booking.dataValues.show = show;
  } catch (err) {
    console.error(`[Booking] Failed to fetch show for booking ${bookingId}`);
  }

  return booking;
};

/**
 * Get all bookings for a user. Enriched with show details.
 */
export const getUserBookings = async (userId) => {
  const bookings = await Booking.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  for (const booking of bookings) {
    try {
      const show = await showService.getShowById(booking.showId);
      booking.dataValues.show = show;
    } catch {
      // Non-fatal — show might have been deleted
    }
  }

  return bookings;
};

export default { createBooking, confirmBooking, failBooking, getBookingById, getUserBookings };
