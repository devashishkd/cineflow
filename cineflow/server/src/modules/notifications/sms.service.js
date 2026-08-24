/**
 * SMS service — Mock implementation.
 *
 * Replace sendSms body with a Twilio/SNS call when ready:
 *   import twilio from 'twilio';
 *   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 *   await client.messages.create({ body, from: process.env.TWILIO_FROM, to });
 */

const sendSms = async ({ to, body }) => {
  console.log(`[SMS] 📱 Mock SMS → ${to}`);
  console.log(`[SMS]    ${body}`);
};

export const sendBookingConfirmationSms = async ({ to, bookingId, seatNumbers }) => {
  const seats = (seatNumbers || []).join(', ');
  await sendSms({
    to,
    body: `✅ Booking confirmed! Seats: ${seats} | Booking ID: ${bookingId}. Enjoy the movie! 🍿`,
  });
};

export const sendBookingFailureSms = async ({ to, bookingId, reason }) => {
  await sendSms({
    to,
    body: `❌ Booking ${bookingId} failed: ${reason}. Your seats have been released.`,
  });
};

export default { sendBookingConfirmationSms, sendBookingFailureSms };
