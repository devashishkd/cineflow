import createConsumer from '../../../../shared/kafka/consumer.js';
import notificationService from '../services/notification.service.js';

const BOOKING_CONFIRMED = 'booking-confirmed';
const PAYMENT_FAILED    = 'payment-failed';

/**
 * Notification Service Kafka Consumer
 *
 * Listens to: "booking-confirmed" → sends success notification
 * Listens to: "payment-failed"    → sends failure notification
 */
const startNotificationWorker = async () => {
  const consumer = createConsumer('notification-service', 'notification-group');

  await consumer.subscribe(
    [BOOKING_CONFIRMED, PAYMENT_FAILED],
    async (topic, message) => {
      const payload = JSON.parse(message.value.toString());

      if (topic === BOOKING_CONFIRMED) {
        await notificationService.sendBookingConfirmation(payload);
      } else if (topic === PAYMENT_FAILED) {
        await notificationService.sendBookingFailure(payload);
      }
    }
  );

  console.log('[Notification Worker] 🚀 Listening for booking-confirmed and payment-failed events...');
};

export default startNotificationWorker;
