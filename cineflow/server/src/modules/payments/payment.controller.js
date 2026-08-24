import paymentService from './payment.service.js';
import bookingService from '../bookings/booking.service.js';
import showService from '../shows/show.service.js';
import seatLockService from '../bookings/seat-lock.service.js';
import notificationService from '../notifications/notification.service.js';

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a pending booking.
 */
export const createOrder = async (req, res) => {
  try {
    const { bookingId, userId, amount, currency = 'INR' } = req.body;

    if (!bookingId || !userId || !amount) {
      return res.status(400).json({ success: false, message: 'bookingId, userId, and amount are required' });
    }

    const orderData = await paymentService.createOrder({ bookingId, userId, amount, currency });

    res.status(200).json({
      success: true,
      data: { ...orderData, keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (err) {
    console.error('[Payment] Error creating order:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

/**
 * POST /api/payments/verify
 *
 * Monolith payment confirmation flow (replaces Kafka):
 *   Payment success → confirm booking + update seats + send notification (fire-and-forget)
 *   Payment failure → fail booking + release seat locks + send notification (fire-and-forget)
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      userId,
      showId,
      seatIds,
      amount,
    } = req.body;

    const { isValid } = await paymentService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (isValid) {
      // ── 1. Confirm booking ──────────────────────────────────────────────
      await bookingService.confirmBooking(bookingId);

      // ── 2. Mark seats BOOKED ────────────────────────────────────────────
      await showService.updateSeatStatus(seatIds, 'BOOKED');

      // ── 3. Release Redis seat locks ─────────────────────────────────────
      await seatLockService.releaseSeats(seatIds);

      // ── 4. Fetch confirmed seat numbers for notification ─────────────────
      const booking = await bookingService.getBookingById(bookingId, userId);

      // ── 5. Send confirmation notification (fire-and-forget) ──────────────
      notificationService
        .processBookingConfirmation({
          userId,
          bookingId,
          showId,
          seatIds,
          seatNumbers: booking.seatNumbers,
          transactionId: razorpay_payment_id,
        })
        .catch((err) => console.error('[Payment] Notification error:', err.message));

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });

    } else {
      // ── 1. Fail booking ─────────────────────────────────────────────────
      await bookingService.failBooking(bookingId);

      // ── 2. Release seat locks ────────────────────────────────────────────
      await seatLockService.releaseSeats(seatIds);

      // ── 3. Send failure notification (fire-and-forget) ───────────────────
      notificationService
        .processBookingFailure({ userId, bookingId, reason: 'Signature verification failed' })
        .catch((err) => console.error('[Payment] Notification error:', err.message));

      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error('[Payment] Error verifying payment:', err);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

export default { createOrder, verifyPayment };
