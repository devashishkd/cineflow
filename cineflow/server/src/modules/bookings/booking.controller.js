import bookingService from './booking.service.js';
import seatLockService from './seat-lock.service.js';
import { generateTicketPdf } from '../../utils/pdf.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { ValidationError } from '../../utils/errors.js';

/**
 * POST /api/bookings
 * Create a pending booking and lock seats in Redis.
 *
 * Supports idempotency via the `Idempotency-Key` header.
 * Client should generate a UUID before the request and retry with the same key.
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { showId, seatIds } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || null;

  if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new ValidationError('showId and seatIds (non-empty array) are required');
  }

  const booking = await bookingService.createBooking({
    userId: req.user.userId,
    showId,
    seatIds,
    idempotencyKey,
  });

  // Return expiresAt so the frontend can show a countdown timer
  res.status(201).json({
    success: true,
    message: 'Booking created — seats locked for 10 minutes. Complete payment to confirm.',
    data: booking,
  });
});

/**
 * GET /api/bookings/:id
 * Get a single booking owned by the authenticated user.
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
  res.json({ success: true, data: booking });
});

/**
 * GET /api/bookings/me
 * Get all bookings for the authenticated user.
 */
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.userId);
  res.json({ success: true, count: bookings.length, data: bookings });
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking — transitions to CANCELLED, releases seats and Redis locks.
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user.userId,
    reason || 'User requested cancellation'
  );
  res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

/**
 * GET /api/bookings/:id/pdf
 * Generate and stream a PDF ticket for a CONFIRMED booking.
 */
export const generatePdfTicket = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.userId);

  if (booking.status !== 'CONFIRMED') {
    throw new ValidationError('PDF ticket is only available for confirmed bookings');
  }

  generateTicketPdf(res, booking);
});

/**
 * GET /api/bookings/:id/lock-status
 * Returns remaining seat lock TTL for the frontend countdown timer.
 * Only useful while the booking is in PENDING or PAYMENT_INITIATED state.
 */
export const getLockStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.userId);

  // Get TTL for the first seat (all seats share the same lock TTL)
  const seatId = booking.seatIds?.[0];
  const ttlSeconds = seatId ? await seatLockService.getSeatLockTTL(seatId) : 0;

  res.json({
    success: true,
    data: {
      bookingId:  booking.id,
      status:     booking.status,
      expiresAt:  booking.expiresAt,
      ttlSeconds,
    },
  });
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings(req.query);
  res.json({ success: true, count: bookings.length, data: bookings });
});

export default { createBooking, getBookingById, getUserBookings, cancelBooking, generatePdfTicket, getLockStatus, getAllBookings };
