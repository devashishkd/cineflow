import Payment from '../models/payment.model.js';
import { randomUUID } from 'crypto';

/**
 * Mock Payment Processor
 *
 * Simulates real payment gateway behaviour:
 *   - 90% of the time: payment succeeds
 *   - 10% of the time: payment fails
 *
 * In a real system this would call Razorpay, Stripe, etc.
 */
const processPayment = async ({ bookingId, userId, amount }) => {
  // Record the pending payment
  const payment = await Payment.create({
    bookingId,
    userId,
    amount,
    status: 'PENDING',
  });

  // Simulate network delay (300–800ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  // 90% success rate
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    const transactionId = `TXN-${randomUUID().split('-')[0].toUpperCase()}`;
    await payment.update({ status: 'COMPLETED', transactionId });
    console.log(`[Payment] ✅ SUCCESS — bookingId: ${bookingId}, txnId: ${transactionId}`);
    return { success: true, payment };
  } else {
    const failureReason = 'Insufficient funds (mock failure)';
    await payment.update({ status: 'FAILED', failureReason });
    console.log(`[Payment] ❌ FAILED — bookingId: ${bookingId}`);
    return { success: false, payment };
  }
};

export default { processPayment };
