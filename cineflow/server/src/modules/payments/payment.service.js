import Payment from './payment.model.js';
import paymentGateway from './razorpay.gateway.js';

/**
 * Create a Razorpay order and upsert a local Payment record.
 */
export const createOrder = async ({ bookingId, userId, amount, currency = 'INR' }) => {
  let payment = await Payment.findOne({ where: { bookingId } });
  if (!payment) {
    payment = await Payment.create({ bookingId, userId, amount, status: 'PENDING' });
  }

  const receipt = `ro_${bookingId}`.substring(0, 40);
  const order   = await paymentGateway.createOrder({ amount, currency, receipt });

  await payment.update({ transactionId: order.id });

  return { orderId: order.id, amount: order.amount, currency: order.currency };
};

/**
 * Verify the Razorpay signature and update the Payment record.
 */
export const verifySignature = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const isValid = paymentGateway.verifySignature({
    orderId:   razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  const payment = await Payment.findOne({ where: { transactionId: razorpay_order_id } });

  if (isValid && payment) {
    await payment.update({ status: 'COMPLETED', transactionId: razorpay_payment_id });
  } else if (payment) {
    await payment.update({ status: 'FAILED', failureReason: 'Signature verification failed' });
  }

  return { isValid, payment };
};

export default { createOrder, verifySignature };
