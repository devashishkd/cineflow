import express from 'express';
import bookingController from './booking.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/requireRole.middleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Static before dynamic
router.get('/me',  bookingController.getUserBookings);
router.get('/all', requireRole('ADMIN', 'THEATRE_MANAGER'), bookingController.getAllBookings);

router.post('/',                  bookingController.createBooking);
router.get('/:id',                bookingController.getBookingById);
router.get('/:id/pdf',            bookingController.generatePdfTicket);
router.get('/:id/lock-status',    bookingController.getLockStatus);
router.post('/:id/cancel',        bookingController.cancelBooking);

export default router;
