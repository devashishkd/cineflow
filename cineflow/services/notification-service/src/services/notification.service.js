import emailService from './email.service.js';
import smsService from './sms.service.js';
import analyticsService from './analytics.service.js';
import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

/**
 * Helper to fetch user details dynamically if they aren't provided in the event.
 */
const getUserDetails = async (userId, existingEmail, existingPhone) => {
  let email = existingEmail;
  let phone = existingPhone;

  if (!email && userId) {
    try {
      const res = await axios.get(`${USER_SERVICE_URL}/api/auth/internal/${userId}`);
      if (res.data && res.data.data) {
        email = res.data.data.email;
        // Phone could also be fetched here if user-service supported it
      }
    } catch (err) {
      console.error(`[Notification Orchestrator] Failed to fetch user ${userId}:`, err.message);
    }
  }

  return { email, phone };
};

/**
 * Orchestrator: Coordinates Email, SMS, and Analytics for Booking Confirmation
 */
const processBookingConfirmation = async ({ userId, bookingId, seatNumbers, showId, transactionId, userEmail, userPhone }) => {
  const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

  // 1. Email
  if (email) {
    await emailService.sendBookingConfirmationEmail({ 
      to: email, bookingId, seatNumbers, showId, transactionId 
    });
  }

  // 2. SMS
  if (phone) {
    await smsService.sendBookingConfirmationSms({ 
      to: phone, bookingId, seatNumbers 
    });
  }

  // 3. Analytics
  await analyticsService.trackBookingConfirmed({ 
    userId, bookingId, showId, seatNumbers, transactionId 
  });
};

/**
 * Orchestrator: Coordinates Email, SMS, and Analytics for Booking Failure
 */
const processBookingFailure = async ({ userId, bookingId, reason, userEmail, userPhone }) => {
  const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

  // 1. Email
  if (email) {
    await emailService.sendBookingFailureEmail({ 
      to: email, bookingId, reason 
    });
  }

  // 2. SMS
  if (phone) {
    await smsService.sendBookingFailureSms({ 
      to: phone, bookingId, reason 
    });
  }

  // 3. Analytics
  await analyticsService.trackBookingFailure({ 
    userId, bookingId, reason 
  });
};

export default { processBookingConfirmation, processBookingFailure };
