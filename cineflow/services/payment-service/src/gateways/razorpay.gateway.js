import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay implementation of the payment gateway interface.
 *
 * Gateway interface contract:
 *   createOrder({ amount, currency, receipt }) → { id, amount, currency }
 *   verifySignature({ orderId, paymentId, signature }) → boolean
 */
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  console.log(`[Razorpay Gateway] Key ID: ${keyId ? keyId.slice(0, 12) + '...' : 'NOT SET'}`);
  console.log(`[Razorpay Gateway] Key Secret set: ${keySecret ? 'YES (' + keySecret.length + ' chars)' : 'NO'}`);
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

/**
 * Creates a payment order on Razorpay.
 * @param {{ amount: number, currency: string, receipt: string }} options
 * @returns {{ id: string, amount: number, currency: string }}
 */
const createOrder = async ({ amount, currency, receipt }) => {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: amount * 100, // Razorpay works in paise
    currency,
    receipt,
  });
  return { id: order.id, amount: order.amount, currency: order.currency };
};

/**
 * Verifies the Razorpay webhook/checkout signature.
 * @param {{ orderId: string, paymentId: string, signature: string }} params
 * @returns {boolean}
 */
const verifySignature = ({ orderId, paymentId, signature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

export default { createOrder, verifySignature };
