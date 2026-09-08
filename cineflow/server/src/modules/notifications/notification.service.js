import { notificationQueue } from './notification.queue.js';

export const processBookingConfirmation = async (data) => {
  await notificationQueue.add('booking_confirmation_job', {
    type: 'booking_confirmation',
    data,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
};

export const processBookingFailure = async (data) => {
  await notificationQueue.add('booking_failure_job', {
    type: 'booking_failure',
    data,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
};

export default { processBookingConfirmation, processBookingFailure };
