import PDFDocument from 'pdfkit';

/**
 * Generates a Cineflow E-Ticket PDF and pipes it to an HTTP response.
 *
 * @param {object} res       - Express response object
 * @param {object} booking   - Booking record (with .dataValues.show enriched)
 */
export const generateTicketPdf = (res, booking) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=ticket-${booking.id.slice(0, 8)}.pdf`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(24).fillColor('#14b8a6').text('Cineflow E-Ticket', { align: 'center' });
  doc.moveDown();

  // Show info
  const show = booking.dataValues?.show;
  if (show && show.movie) {
    doc.fontSize(20).fillColor('black').text(show.movie.title);
    doc.fontSize(12).fillColor('gray').text(`${show.theatre.name}, ${show.theatre.city}`);
    doc.text(`${show.showDate} | ${show.showTime}`);
    doc.moveDown();
  }

  // Booking details
  doc.fontSize(14).fillColor('black').text(`Booking ID: ${booking.id.toUpperCase()}`);
  doc.text(`Seats: ${booking.seatNumbers.join(', ')}`);
  doc.text(`Total Amount: INR ${booking.totalAmount}`);
  doc.moveDown();

  doc.fontSize(10).fillColor('gray').text('Please show this ticket at the entrance.', { align: 'center' });

  doc.end();
};

/**
 * Generates a PDF buffer (for email attachments).
 * Returns a Promise<Buffer>.
 */
export const generateTicketPdfBuffer = (booking, show) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(24).fillColor('#14b8a6').text('Cineflow E-Ticket', { align: 'center' });
    doc.moveDown();

    if (show && show.movie) {
      doc.fontSize(20).fillColor('black').text(show.movie.title);
      doc.fontSize(12).fillColor('gray').text(`${show.theatre.name}, ${show.theatre.city}`);
      doc.text(`${show.showDate} | ${show.showTime}`);
      doc.moveDown();
    }

    doc.fontSize(14).fillColor('black').text(`Booking ID: ${booking.bookingId?.toUpperCase() || ''}`);
    doc.text(`Seats: ${(booking.seatNumbers || []).join(', ')}`);
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text('Please show this ticket at the entrance.', { align: 'center' });

    doc.end();
  });
};
