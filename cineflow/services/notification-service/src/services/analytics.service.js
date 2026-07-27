import analyticsChannel from '../channels/analytics.channel.js';

const trackBookingConfirmed = async ({ userId, bookingId, showId, seatNumbers, transactionId }) => {
  await analyticsChannel.track({
    event: 'booking_confirmed',
    userId,
    metadata: { bookingId, showId, seatNumbers, transactionId },
  });
};

const trackBookingFailure = async ({ userId, bookingId, reason }) => {
  await analyticsChannel.track({
    event: 'booking_failed',
    userId,
    metadata: { bookingId, reason },
  });
};

export default { trackBookingConfirmed, trackBookingFailure };
