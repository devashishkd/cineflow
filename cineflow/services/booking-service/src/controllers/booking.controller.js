import bookingService from '../services/booking.service.js';
import PDFDocument from 'pdfkit';

const createBooking = async (req, res) => {
  try {
    const { showId, seatIds } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'showId and seatIds (non-empty array) are required',
      });
    }

    const booking = await bookingService.createBooking({
      userId: req.user.userId, // from JWT via auth middleware
      showId,
      seatIds,
    });

    res.status(201).json({ success: true, message: 'Booking confirmed!', data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.userId);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const generatePdfTicket = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.userId);
    
    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Can only download confirmed bookings' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.id.slice(0,8)}.pdf`);
    
    doc.pipe(res);

    // Build the PDF
    doc.fontSize(24).fillColor('#14b8a6').text('Cineflow E-Ticket', { align: 'center' });
    doc.moveDown();
    
    if (booking.dataValues.show && booking.dataValues.show.movie) {
      doc.fontSize(20).fillColor('black').text(booking.dataValues.show.movie.title);
      doc.fontSize(12).fillColor('gray').text(`${booking.dataValues.show.theatre.name}, ${booking.dataValues.show.theatre.city}`);
      doc.text(`${booking.dataValues.show.showDate} | ${booking.dataValues.show.showTime}`);
      doc.moveDown();
    }

    doc.fontSize(14).fillColor('black').text(`Booking ID: ${booking.id.toUpperCase()}`);
    doc.text(`Seats: ${booking.seatNumbers.join(', ')}`);
    doc.text(`Total Amount: INR ${booking.totalAmount}`);
    doc.moveDown();

    doc.fontSize(10).fillColor('gray').text('Please show this ticket at the entrance.', { align: 'center' });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { createBooking, getBookingById, getUserBookings, generatePdfTicket };
