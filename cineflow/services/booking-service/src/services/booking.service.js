import axios from 'axios';
import Booking from '../models/booking.model.js';

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';

/**
 * Phase 1 Booking Flow (synchronous, no Redis/Kafka):
 *
 * 1. Fetch show details from movie-service (includes all seats)
 * 2. Check if selected seats are all AVAILABLE
 * 3. Calculate total amount
 * 4. Create booking (status: PENDING)
 * 5. Call movie-service to mark seats as BOOKED
 * 6. Confirm booking (status: CONFIRMED)
 *
 * KNOWN LIMITATION: Race condition possible if two users book same seat simultaneously.
 * This is intentional — Phase 2 will solve this with Redis seat locking (SETNX + TTL).
 */
const createBooking = async ({ userId, showId, seatIds }) => {
  // Step 1: Get show + seats from movie-service
  let show;
  try {
    const res = await axios.get(`${MOVIE_SERVICE_URL}/api/shows/${showId}`);
    show = res.data.data;
  } catch (err) {
    throw new Error('Could not fetch show details. Movie service may be unavailable.');
  }

  // Step 2: Validate that selected seats belong to this show and are AVAILABLE
  const allShowSeatIds = show.seats.map((s) => s.id);
  const invalidSeats = seatIds.filter((id) => !allShowSeatIds.includes(id));
  if (invalidSeats.length > 0) {
    throw new Error(`Some seats do not belong to this show`);
  }

  const selectedSeats = show.seats.filter((s) => seatIds.includes(s.id));
  const unavailable = selectedSeats.filter((s) => s.status !== 'AVAILABLE');
  if (unavailable.length > 0) {
    const takenSeats = unavailable.map((s) => s.seatNumber).join(', ');
    throw new Error(`Seats already taken: ${takenSeats}`);
  }

  // Step 3: Calculate total amount
  const pricePerSeat = parseFloat(show.price);
  const totalAmount = pricePerSeat * selectedSeats.length;
  const seatNumbers = selectedSeats.map((s) => s.seatNumber);

  // Step 4: Create booking with PENDING status
  const booking = await Booking.create({
    userId,
    showId,
    seatIds,
    seatNumbers,
    totalAmount,
    status: 'PENDING',
  });

  // Step 5: Mark seats as BOOKED in movie-service
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

  // Step 6: Confirm booking
  await booking.update({ status: 'CONFIRMED' });

  return booking;
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
