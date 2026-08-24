import bookingService from './booking.service.js';
import { generateTicketPdf } from '../../utils/pdf.js';

export const createBooking = async (req, res) => {
  try {
    const { showId, seatIds } = req.body;
    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'showId and seatIds (non-empty array) are required',
      });
    }

    const booking = await bookingService.createBooking({
      userId: req.user.userId,
      showId,
      seatIds,
    });

    res.status(201).json({ success: true, message: 'Booking created (pending payment)', data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.userId);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generatePdfTicket = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.userId);

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Can only download confirmed bookings' });
    }

    generateTicketPdf(res, booking);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { createBooking, getBookingById, getUserBookings, generatePdfTicket };
