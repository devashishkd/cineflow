import Payment from './payment.model.js';
import paymentGateway from './razorpay.gateway.js';

export const createOrder = async ({ bookingId, userId, amount, currency = 'INR' }) => {
  let payment = await Payment.findOne({ bookingId });
  if (!payment) {
    payment = await Payment.create({ bookingId, userId, amount, status: 'PENDING' });
  }

  const receipt = `ro_${bookingId}`.substring(0, 40);
  const order   = await paymentGateway.createOrder({ amount, currency, receipt });

  payment.transactionId = order.id;
  await payment.save();

  return { orderId: order.id, amount: order.amount, currency: order.currency };
};

export const verifySignature = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const isValid = paymentGateway.verifySignature({
    orderId:   razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  const payment = await Payment.findOne({ transactionId: razorpay_order_id });

  if (isValid && payment) {
    payment.status = 'COMPLETED';
    payment.transactionId = razorpay_payment_id;
    await payment.save();
  } else if (payment) {
    payment.status = 'FAILED';
    payment.failureReason = 'Signature verification failed';
    await payment.save();
  }

  return { isValid, payment };
};

export default { createOrder, verifySignature };
