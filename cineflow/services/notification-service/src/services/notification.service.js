/**
 * Notification Service
 *
 * Sends notifications to users after booking outcomes.
 * Currently logs to console — replace with Nodemailer/Twilio in production.
 */

const sendBookingConfirmation = ({ userId, bookingId, seatNumbers, showId, transactionId }) => {
  console.log(`\n📧 [Notification] ━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   To:          User ${userId}`);
  console.log(`   Subject:     🎬 Your Booking is Confirmed!`);
  console.log(`   Booking ID:  ${bookingId}`);
  console.log(`   Show ID:     ${showId}`);
  console.log(`   Seats:       ${(seatNumbers || []).join(', ')}`);
  console.log(`   Transaction: ${transactionId}`);
  console.log(`   Message:     Enjoy the movie! 🍿`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
};

const sendBookingFailure = ({ userId, bookingId, reason }) => {
  console.log(`\n📧 [Notification] ━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   To:          User ${userId}`);
  console.log(`   Subject:     ❌ Booking Failed`);
  console.log(`   Booking ID:  ${bookingId}`);
  console.log(`   Reason:      ${reason}`);
  console.log(`   Message:     Your seats have been released. Please try again.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
};

export default { sendBookingConfirmation, sendBookingFailure };
