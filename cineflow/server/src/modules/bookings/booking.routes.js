import express from 'express';
import bookingController from './booking.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Static before dynamic
router.get('/me', bookingController.getUserBookings);

router.post('/',         bookingController.createBooking);
router.get('/:id',       bookingController.getBookingById);
router.get('/:id/pdf',   bookingController.generatePdfTicket);

export default router;
