import Payment from '../models/payment.model.js';
import paymentGateway from '../gateways/razorpay.gateway.js';

/**
 * Creates a payment order via the payment gateway.
 * payment.service.js has no knowledge of Razorpay internals —
 * swap the gateway import above to switch providers.
 */
const createOrder = async ({ bookingId, userId, amount, currency = 'INR' }) => {
  // Upsert a local Payment record
  let payment = await Payment.findOne({ where: { bookingId } });
  if (!payment) {
    payment = await Payment.create({ bookingId, userId, amount, status: 'PENDING' });
  }

  // Delegate to the gateway
  const receipt = `ro_${bookingId}`.substring(0, 40);
  const order = await paymentGateway.createOrder({ amount, currency, receipt });

  // Persist the gateway order ID
  await payment.update({ transactionId: order.id });

  return { orderId: order.id, amount: order.amount, currency: order.currency };
};

/**
 * Verifies the gateway signature and updates the Payment record.
 */
const verifySignature = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const isValid = paymentGateway.verifySignature({
    orderId: razorpay_order_id,
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
