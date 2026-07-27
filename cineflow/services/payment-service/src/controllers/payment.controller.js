import paymentService from '../services/payment.service.js';
import { getProducer } from '../events/producer.js';

const PAYMENT_SUCCESS = 'payment-success';
const PAYMENT_FAILED = 'payment-failed';

const createOrder = async (req, res) => {
  try {
    const { bookingId, userId, amount, currency = 'INR' } = req.body;
    
    if (!bookingId || !userId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const orderData = await paymentService.createOrder({ bookingId, userId, amount, currency });
    
    res.status(200).json({
      success: true,
      data: {
        ...orderData,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('[Payment Controller] Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId,
      userId,
      showId,
      seatIds,
      amount
    } = req.body;

    const { isValid, payment } = await paymentService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    const producer = await getProducer();

    if (isValid) {
      await producer.publish(PAYMENT_SUCCESS, {
        bookingId,
        userId,
        showId,
        seatIds,
        amount,
        transactionId: razorpay_payment_id,
      });
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      await producer.publish(PAYMENT_FAILED, {
        bookingId,
        userId,
        showId,
        seatIds,
        reason: 'Signature verification failed',
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('[Payment Controller] Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

export default { createOrder, verifyPayment };
