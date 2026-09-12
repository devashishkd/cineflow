import mongoose from 'mongoose';
import Booking, { BOOKING_STATUS, VALID_TRANSITIONS } from './booking.model.js';
import seatLockService from './seat-lock.service.js';
import showService from '../shows/show.service.js';
import Show from '../shows/show.model.js';
import { NotFoundError, ValidationError, ConflictError } from '../../utils/errors.js';

const LOCK_TTL_SECONDS = 600;

/**
 * Transition a booking to a new status, enforcing the state machine.
 * Uses optimistic locking: findOneAndUpdate with expected fromStatus in filter.
 */
export const transitionBooking = async (bookingId, toStatus, extraFields = {}, session = null) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new NotFoundError(`Booking ${bookingId} not found`);

  const fromStatus = booking.status;
  const allowed    = VALID_TRANSITIONS[fromStatus] || [];

  if (!allowed.includes(toStatus)) {
    throw new ValidationError(
      `Invalid status transition: ${fromStatus} → ${toStatus}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }

  // Optimistic lock: only update if current status still matches
  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: fromStatus },
    { $set: { status: toStatus, ...extraFields } },
    { new: true, session }
  );

  if (!updatedBooking) {
    throw new ConflictError(
      `Booking ${bookingId} was already updated by a concurrent request. Please refresh.`
    );
  }

  console.log(`[Booking] ✅ ${bookingId}: ${fromStatus} → ${toStatus}`);
  return updatedBooking;
};

/**
 * Create a PENDING booking.
 *
 * 1. Lock seats atomically in Redis
 * 2. Validate in MongoDB (inside a session/transaction)
 * 3. Create Booking
 */
export const createBooking = async ({ userId, showId, seatIds, idempotencyKey }) => {
  if (idempotencyKey) {
    const existing = await Booking.findOne({ idempotencyKey });
    if (existing) {
      console.log(`[Booking] Idempotent hit for key ${idempotencyKey}`);
      return existing;
    }
  }

  // Redis lock
  await seatLockService.lockSeats(seatIds, userId, LOCK_TTL_SECONDS);

  try {
    const session = await mongoose.startSession();
    let booking;

    await session.withTransaction(async () => {
      const show = await showService.getShowById(showId); // includes seats

      const allShowSeatIds = show.seats.map((s) => s._id.toString());
      const invalidSeats   = seatIds.filter((id) => !allShowSeatIds.includes(id.toString()));
      if (invalidSeats.length > 0) {
        throw new ValidationError(`Seats [${invalidSeats.join(', ')}] do not belong to show ${showId}`);
      }

      const selectedSeats = show.seats.filter((s) => seatIds.map(String).includes(s._id.toString()));
      const unavailable   = selectedSeats.filter((s) => s.status !== 'AVAILABLE');
      if (unavailable.length > 0) {
        const taken = unavailable.map((s) => s.seatNumber).join(', ');
        throw new ConflictError(`Seats already taken: ${taken}. Please select different seats.`);
      }

      const pricePerSeat = parseFloat(show.price);
      const totalAmount  = pricePerSeat * selectedSeats.length;
      const seatNumbers  = selectedSeats.map((s) => s.seatNumber);
      const expiresAt    = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);

      [booking] = await Booking.create([{
        userId,
        showId,
        seatIds,
        seatNumbers,
        totalAmount,
        status: BOOKING_STATUS.PENDING,
        idempotencyKey: idempotencyKey || undefined,
        expiresAt,
      }], { session });
    });

    await session.endSession();
    return booking;
  } catch (err) {
    // Rollback Redis locks if DB transaction fails
    await seatLockService.releaseSeats(seatIds);
    throw err;
  }
};

export const initiatePayment = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.PAYMENT_INITIATED);
export const markPaymentSuccess = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.PAYMENT_SUCCESS);

export const confirmBooking = async (bookingId) => {
  const session = await mongoose.startSession();
  let result;
  await session.withTransaction(async () => {
    const booking = await transitionBooking(bookingId, BOOKING_STATUS.CONFIRMED, {}, session);
    // Mark seats as BOOKED in DB
    await showService.updateSeatStatus(booking.seatIds, 'BOOKED');
    result = booking;
  });
  await session.endSession();
  return result;
};

export const failBooking   = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.PAYMENT_FAILED);
export const expireBooking = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.EXPIRED);

export const cancelBooking = async (bookingId, userId, reason = 'User requested cancellation') => {
  const filter = { _id: bookingId };
  if (userId) filter.userId = userId;

  const booking = await Booking.findOne(filter);
  if (!booking) throw new NotFoundError('Booking not found or does not belong to you');

  const session = await mongoose.startSession();
  let updatedBooking;

  await session.withTransaction(async () => {
    updatedBooking = await transitionBooking(bookingId, BOOKING_STATUS.CANCELLED, {
      cancelledAt: new Date(),
      cancellationReason: reason,
    }, session);

    // Release seats back to AVAILABLE if they were BOOKED
    await showService.updateSeatStatus(booking.seatIds, 'AVAILABLE', 'BOOKED');
  });

  await session.endSession();

  // Release Redis locks
  await seatLockService.releaseSeats(booking.seatIds);

  console.log(`[Booking] 🚫 Booking ${bookingId} cancelled — ${reason}`);
  return updatedBooking;
};

export const getBookingById = async (bookingId, userId, role = 'USER') => {
  const filter = { _id: bookingId };
  if (role !== 'ADMIN' && userId) {
    filter.userId = userId;
  }
  const booking = await Booking.findOne(filter);
  if (!booking) throw new NotFoundError('Booking not found');

  const bookingJson = booking.toJSON ? booking.toJSON() : { ...booking };
  try {
    bookingJson.show = await showService.getShowById(booking.showId);
  } catch (e) {
    console.error('[Booking] Show populate warning:', e.message);
  }

  return bookingJson;
};

export const getUserBookings = async (userId) => {
  return Booking.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId' },
        { path: 'theatreId' },
      ],
    });
};

export const getAllBookings = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  return Booking.find(query).sort({ createdAt: -1 }).limit(200);
};

export default {
  createBooking,
  transitionBooking,
  initiatePayment,
  markPaymentSuccess,
  confirmBooking,
  failBooking,
  expireBooking,
  cancelBooking,
  getBookingById,
  getUserBookings,
  getAllBookings,
};
