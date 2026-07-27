import express from 'express';
const router = express.Router();
import bookingController from '../controllers/booking.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

// All booking routes require authentication
router.use(authMiddleware);

// POST /api/bookings      — create a new booking
// GET  /api/bookings/me   — get all bookings for logged-in user
// GET  /api/bookings/:id  — get a specific booking

// Static route before dynamic
router.get('/me', bookingController.getUserBookings);

router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.get('/:id/pdf', bookingController.generatePdfTicket);

export default router;
