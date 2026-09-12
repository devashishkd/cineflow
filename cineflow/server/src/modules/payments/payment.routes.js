import express from 'express';
import paymentController from './payment.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

router.post('/create-order', paymentController.createOrder);
router.post('/verify',       paymentController.verifyPayment);

export default router;
