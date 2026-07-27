import Payment from '../models/payment.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

/**
 * Creates a Razorpay order
 */
const createOrder = async ({ bookingId, userId, amount, currency = 'INR' }) => {
  // Ensure we have a Payment record
  let payment = await Payment.findOne({ where: { bookingId } });
  if (!payment) {
    payment = await Payment.create({
      bookingId,
      userId,
      amount,
      status: 'PENDING',
    });
  }

  const options = {
    amount: amount * 100, // Razorpay amount is in paise
    currency,
    receipt: `receipt_order_${bookingId}`
  };

  const order = await razorpay.orders.create(options);
  
  await payment.update({ transactionId: order.id }); // store razorpay order id as transactionId initially
  
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency
  };
};

/**
 * Verifies Razorpay signature
 */
const verifySignature = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  const isValid = generatedSignature === razorpay_signature;

  const payment = await Payment.findOne({ where: { transactionId: razorpay_order_id } });

  if (isValid && payment) {
    await payment.update({ 
      status: 'COMPLETED',
      transactionId: razorpay_payment_id // Update to actual payment ID
    });
  } else if (payment) {
    await payment.update({ 
      status: 'FAILED',
      failureReason: 'Signature verification failed'
    });
  }

  return { isValid, payment };
};

export default { createOrder, verifySignature };
