import emailService from './email.service.js';
import smsService from './sms.service.js';
import analyticsService from '../analytics/analytics.service.js';
import authService from '../auth/auth.service.js';

/**
 * Fetch user contact details.
 * Calls authService.getProfile() directly (no HTTP to user-service).
 */
const getUserDetails = async (userId, existingEmail, existingPhone) => {
  let email = existingEmail;
  const phone = existingPhone;

  if (!email && userId) {
    try {
      const user = await authService.getProfile(userId);
      email = user.email;
    } catch (err) {
      console.error(`[Notification] Failed to fetch user ${userId}:`, err.message);
    }
  }

  return { email, phone };
};

/**
 * Handle booking confirmation: Email + SMS + Analytics.
 * Called fire-and-forget from payment.controller after successful Razorpay payment.
 */
export const processBookingConfirmation = async ({
  userId, bookingId, seatNumbers, showId, transactionId, userEmail, userPhone,
}) => {
  const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

  if (email) {
    await emailService.sendBookingConfirmationEmail({ to: email, bookingId, seatNumbers, showId, transactionId });
  }

  if (phone) {
    await smsService.sendBookingConfirmationSms({ to: phone, bookingId, seatNumbers });
  }

  await analyticsService.trackBookingConfirmed({ userId, bookingId, showId, seatNumbers, transactionId });
};

/**
 * Handle booking failure: Email + SMS + Analytics.
 */
export const processBookingFailure = async ({
  userId, bookingId, reason, userEmail, userPhone,
}) => {
  const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

  if (email) {
    await emailService.sendBookingFailureEmail({ to: email, bookingId, reason });
  }

  if (phone) {
    await smsService.sendBookingFailureSms({ to: phone, bookingId, reason });
  }

  await analyticsService.trackBookingFailure({ userId, bookingId, reason });
};

export default { processBookingConfirmation, processBookingFailure };
