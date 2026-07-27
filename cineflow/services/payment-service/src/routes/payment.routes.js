import express from 'express';
import paymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

export default router;
