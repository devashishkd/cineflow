import emailChannel from '../channels/email.channel.js';

const sendBookingConfirmationEmail = async ({ to, bookingId, seatNumbers, showId, transactionId }) => {
  const seats = (seatNumbers || []).join(', ');
  
  const text = `🎉 Booking Confirmed!

Hi there! Your booking has been confirmed.

Details:
- Booking ID: ${bookingId}
- Show ID: ${showId}
- Seats: ${seats}
- Transaction: ${transactionId}

Enjoy the movie! 🍿`;

  await emailChannel.sendEmail({
    to,
    subject: '🎬 Your Booking is Confirmed!',
    text, // Passing ONLY text
  });
};

const sendBookingFailureEmail = async ({ to, bookingId, reason }) => {
  const text = `❌ Booking Failed

Unfortunately your booking could not be completed.

Details:
- Booking ID: ${bookingId}
- Reason: ${reason}

Your seats have been released. Please try again.`;

  await emailChannel.sendEmail({
    to,
    subject: '❌ Booking Failed',
    text, // Passing ONLY text
  });
};

export default { sendBookingConfirmationEmail, sendBookingFailureEmail };
