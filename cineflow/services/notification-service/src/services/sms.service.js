import smsChannel from '../channels/sms.channel.js';

const sendBookingConfirmationSms = async ({ to, bookingId, seatNumbers }) => {
  const seats = (seatNumbers || []).join(', ');
  const body = `✅ Booking confirmed! Seats: ${seats} | Booking ID: ${bookingId}. Enjoy the movie! 🍿`;

  await smsChannel.sendSms({ to, body });
};

const sendBookingFailureSms = async ({ to, bookingId, reason }) => {
  const body = `❌ Booking ${bookingId} failed: ${reason}. Your seats have been released.`;

  await smsChannel.sendSms({ to, body });
};

export default { sendBookingConfirmationSms, sendBookingFailureSms };
