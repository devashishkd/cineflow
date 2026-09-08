import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import Booking, { BOOKING_STATUS, VALID_TRANSITIONS } from './booking.model.js';
import seatLockService from './seat-lock.service.js';
import showService from '../shows/show.service.js';
import Show from '../shows/show.model.js';
import { NotFoundError, ValidationError, ConflictError } from '../../utils/errors.js';

const LOCK_TTL_SECONDS = 600;

/**
 * Transition a booking to a new status, enforcing the state machine.
 * Uses optimistic locking: where clause includes the expected fromStatus.
 */
export const transitionBooking = async (bookingId, toStatus, extraFields = {}, transaction = null) => {
  const booking = await Booking.findByPk(bookingId, { transaction });
  if (!booking) throw new NotFoundError(`Booking ${bookingId} not found`);

  const fromStatus = booking.status;
  const allowed = VALID_TRANSITIONS[fromStatus] || [];

  if (!allowed.includes(toStatus)) {
    throw new ValidationError(
      `Invalid status transition: ${fromStatus} → ${toStatus}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }

  // Optimistic lock
  const [updatedCount, [updatedBooking]] = await Booking.update(
    { status: toStatus, ...extraFields },
    { 
      where: { id: bookingId, status: fromStatus },
      returning: true,
      transaction 
    }
  );

  if (updatedCount === 0) {
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
 * 2. Validate in Postgres (inside transaction)
 * 3. Create Booking
 */
export const createBooking = async ({ userId, showId, seatIds, idempotencyKey }) => {
  if (idempotencyKey) {
    const existing = await Booking.findOne({ where: { idempotencyKey } });
    if (existing) {
      console.log(`[Booking] Idempotent hit for key ${idempotencyKey}`);
      return existing;
    }
  }

  // Redis lock
  await seatLockService.lockSeats(seatIds, userId, LOCK_TTL_SECONDS);

  try {
    // Postgres Transaction to ensure data consistency when validating and inserting
    const booking = await sequelize.transaction(async (t) => {
      const show = await showService.getShowById(showId); // includes seats

      const allShowSeatIds = show.seats.map((s) => s.id);
      const invalidSeats = seatIds.filter((id) => !allShowSeatIds.includes(id));
      if (invalidSeats.length > 0) {
        throw new ValidationError(`Seats [${invalidSeats.join(', ')}] do not belong to show ${showId}`);
      }

      const selectedSeats = show.seats.filter((s) => seatIds.includes(s.id));
      const unavailable = selectedSeats.filter((s) => s.status !== 'AVAILABLE');
      if (unavailable.length > 0) {
        const taken = unavailable.map((s) => s.seatNumber).join(', ');
        throw new ConflictError(`Seats already taken: ${taken}. Please select different seats.`);
      }

      const pricePerSeat = parseFloat(show.price);
      const totalAmount = pricePerSeat * selectedSeats.length;
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const expiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);

      return await Booking.create({
        userId,
        showId,
        seatIds,
        seatNumbers,
        totalAmount,
        status: BOOKING_STATUS.PENDING,
        idempotencyKey: idempotencyKey || null,
        expiresAt,
      }, { transaction: t });
    });

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
  return await sequelize.transaction(async (t) => {
    const booking = await transitionBooking(bookingId, BOOKING_STATUS.CONFIRMED, {}, t);
    // Mark seats as BOOKED in DB
    await showService.updateSeatStatus(booking.seatIds, 'BOOKED');
    return booking;
  });
};

export const failBooking = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.PAYMENT_FAILED);
export const expireBooking = (bookingId) => transitionBooking(bookingId, BOOKING_STATUS.EXPIRED);

export const cancelBooking = async (bookingId, userId, reason = 'User requested cancellation') => {
  const booking = await Booking.findOne({ where: { id: bookingId, userId } });
  if (!booking) throw new NotFoundError('Booking not found or does not belong to you');

  // Postgres Transaction for multi-table update
  const updatedBooking = await sequelize.transaction(async (t) => {
    const updated = await transitionBooking(bookingId, BOOKING_STATUS.CANCELLED, {
      cancelledAt: new Date(),
      cancellationReason: reason,
    }, t);

    // Release seats in DB back to AVAILABLE if they were BOOKED
    await showService.updateSeatStatus(booking.seatIds, 'AVAILABLE', 'BOOKED');
    return updated;
  });

  // Release Redis locks
  await seatLockService.releaseSeats(booking.seatIds);

  console.log(`[Booking] 🚫 Booking ${bookingId} cancelled — ${reason}`);
  return updatedBooking;
};

export const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({ where: { id: bookingId, userId } });
  if (!booking) throw new NotFoundError('Booking not found');

  const bookingJson = booking.toJSON();
  try {
    bookingJson.show = await showService.getShowById(booking.showId);
  } catch {}

  return bookingJson;
};

export const getUserBookings = async (userId) => {
  const bookings = await Booking.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [{
      model: Show,
      as: 'show',
      include: ['movie', 'theatre']
    }]
  });
  return bookings;
};

export const getAllBookings = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  return Booking.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
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
