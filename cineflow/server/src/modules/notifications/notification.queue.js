import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { getRedisConnectionUrl } from '../../config/redis.js';
import emailService from './email.service.js';
import smsService from './sms.service.js';
import analyticsService from '../analytics/analytics.service.js';
import authService from '../auth/auth.service.js';
import logger from '../../utils/logger.js';

const redisUrl = getRedisConnectionUrl();
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith('rediss://') && { tls: {} }),
});

export const notificationQueue = new Queue('notifications', { connection });

const getUserDetails = async (userId, existingEmail, existingPhone) => {
  let email = existingEmail;
  const phone = existingPhone;

  if (!email && userId) {
    try {
      const user = await authService.getProfile(userId);
      email = user.email;
    } catch (err) {
      logger.error(`[Notification Worker] Failed to fetch user ${userId}: ${err.message}`);
    }
  }

  return { email, phone };
};

const worker = new Worker('notifications', async (job) => {
  const { type, data } = job.data;

  if (type === 'booking_confirmation') {
    const { userId, bookingId, seatNumbers, showId, transactionId, userEmail, userPhone } = data;
    const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

    if (email) {
      await emailService.sendBookingConfirmationEmail({ to: email, bookingId, seatNumbers, showId, transactionId });
    }
    if (phone) {
      await smsService.sendBookingConfirmationSms({ to: phone, bookingId, seatNumbers });
    }
    await analyticsService.trackBookingConfirmed({ userId, bookingId, showId, seatNumbers, transactionId });
  } 
  
  else if (type === 'booking_failure') {
    const { userId, bookingId, reason, userEmail, userPhone } = data;
    const { email, phone } = await getUserDetails(userId, userEmail, userPhone);

    if (email) {
      await emailService.sendBookingFailureEmail({ to: email, bookingId, reason });
    }
    if (phone) {
      await smsService.sendBookingFailureSms({ to: phone, bookingId, reason });
    }
    await analyticsService.trackBookingFailure({ userId, bookingId, reason });
  }
}, { connection });

worker.on('completed', job => {
  logger.info(`[Notification Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`[Notification Worker] Job ${job.id} failed with error ${err.message}`);
});

export default notificationQueue;
