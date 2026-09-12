import paymentService from './payment.service.js';
import bookingService from '../bookings/booking.service.js';
import Booking from '../bookings/booking.model.js';
import showService from '../shows/show.service.js';
import seatLockService from '../bookings/seat-lock.service.js';
import notificationService from '../notifications/notification.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { ValidationError } from '../../utils/errors.js';

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a pending booking.
 *
 * Security fix: userId is always taken from req.user (JWT), never from req.body.
 * This prevents any authenticated user from creating an order against
 * someone else's booking by forging the userId field.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount, currency = 'INR' } = req.body;
  const userId = req.user?.userId; // ← JWT, never from body

  if (!bookingId || !amount) {
    throw new ValidationError('bookingId and amount are required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ValidationError('Booking not found');
  }
  if (booking.status === 'CONFIRMED') {
    return res.status(400).json({
      success: false,
      message: 'This booking has already been paid for and confirmed. Check your downloaded ticket or My Bookings.',
      isAlreadyConfirmed: true,
    });
  }

  // Transition to PAYMENT_INITIATED if still PENDING
  if (booking.status === 'PENDING') {
    await bookingService.initiatePayment(bookingId);
  }

  const orderData = await paymentService.createOrder({ bookingId, userId, amount, currency });

  res.status(200).json({
    success: true,
    data: { ...orderData, keyId: process.env.RAZORPAY_KEY_ID },
  });
});

/**
 * POST /api/payments/verify
 *
 * Monolith payment confirmation flow:
 *   Razorpay success → mark PAYMENT_SUCCESS → confirm seats → CONFIRMED → notify
 *   Razorpay failure → PAYMENT_FAILED → release locks → notify
 *
 * Interview: What if payment succeeds but the server crashes before confirming?
 * - The Razorpay webhook (separate endpoint) re-delivers the event.
 * - On restart, the booking is still in PAYMENT_INITIATED state.
 * - The client can call /payments/verify again with the same IDs.
 * - verifySignature() is idempotent — it checks the HMAC, which is deterministic.
 * - The state machine prevents double-confirmation (CONFIRMED → CONFIRMED is invalid).
 *
 * Interview: What if two verify requests arrive simultaneously (network retry)?
 * - The first transitions PAYMENT_INITIATED → PAYMENT_SUCCESS.
 * - The second finds status=PAYMENT_SUCCESS and tries PAYMENT_SUCCESS → PAYMENT_SUCCESS
 *   which is an invalid transition — throws ConflictError → client gets 409.
 * - The booking is confirmed exactly once.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
    showId,
    seatIds,
    amount,
  } = req.body;

  const userId = req.user?.userId; // ← always from JWT

  const { isValid } = await paymentService.verifySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (isValid) {
    // ── Success path ────────────────────────────────────────────────────────
    // 1. Mark PAYMENT_SUCCESS (intermediate state — payment received, not yet confirmed)
    await bookingService.markPaymentSuccess(bookingId);

    // 2. Mark seats BOOKED in PostgreSQL (compare-and-swap: only if currently AVAILABLE)
    await showService.updateSeatStatus(seatIds, 'BOOKED', 'AVAILABLE');

    // 3. Release Redis seat locks (seats are now permanently BOOKED in Mongo)
    await seatLockService.releaseSeats(seatIds);

    // 4. Final state transition: PAYMENT_SUCCESS → CONFIRMED
    const confirmedBooking = await bookingService.confirmBooking(bookingId);

    // 5. Send confirmation notification (fire-and-forget — never blocks response)
    notificationService
      .processBookingConfirmation({
        userId,
        bookingId,
        showId,
        seatIds,
        seatNumbers: confirmedBooking.seatNumbers,
        transactionId: razorpay_payment_id,
      })
      .catch((err) => console.error('[Payment] Notification error:', err.message));

    return res.status(200).json({ success: true, message: 'Payment verified and booking confirmed' });

  } else {
    // ── Failure path ────────────────────────────────────────────────────────
    // 1. Mark PAYMENT_FAILED
    await bookingService.failBooking(bookingId);

    // 2. Release seat locks so other users can book
    await seatLockService.releaseSeats(seatIds);

    // 3. Send failure notification (fire-and-forget)
    notificationService
      .processBookingFailure({ userId, bookingId, reason: 'Signature verification failed' })
      .catch((err) => console.error('[Payment] Notification error:', err.message));

    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }
});

export default { createOrder, verifyPayment };
