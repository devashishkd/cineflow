import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay payment gateway.
 * Identical to original payment-service — swap this file to change providers.
 */

const getRazorpayClient = () => {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create a Razorpay payment order.
 * @returns {{ id, amount, currency }}
 */
export const createOrder = async ({ amount, currency, receipt }) => {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: amount * 100, // Razorpay uses paise
    currency,
    receipt,
  });
  return { id: order.id, amount: order.amount, currency: order.currency };
};

/**
 * Verify the Razorpay checkout HMAC signature.
 * @returns {boolean}
 */
export const verifySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const hmac   = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest('hex') === signature;
};

export default { createOrder, verifySignature };
