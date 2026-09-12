import PDFDocument from 'pdfkit';

/**
 * Generates a Cineflow E-Ticket PDF and pipes it to an HTTP response.
 *
 * @param {object} res       - Express response object
 * @param {object} booking   - Booking record
 */
export const generateTicketPdf = (res, booking) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const bookingIdStr = String(booking.id || booking._id || '');
  const shortId = bookingIdStr.slice(0, 8);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=ticket-${shortId}.pdf`
  );

  doc.pipe(res);

  // Header Banner
  doc.rect(50, 45, 495, 60).fill('#09090b');
  doc.fontSize(22).fillColor('#10b981').text('CINEFLOW E-TICKET', 50, 62, { align: 'center' });
  doc.fontSize(9).fillColor('#a1a1aa').text('OFFICIAL DIGITAL ADMISSION PASS', 50, 88, { align: 'center' });
  doc.moveDown(3);

  // Show info
  const show = booking.show || booking.dataValues?.show;
  const movieTitle = show?.movie?.title || booking.movieTitle || 'Movie Ticket';
  const theatreName = show?.theatre?.name || 'Multiplex Cinema';
  const theatreCity = show?.theatre?.city ? `, ${show.theatre.city}` : '';
  const showDate = show?.showDate || '';
  const showTime = show?.showTime ? show.showTime.slice(0, 5) : '';

  doc.fontSize(18).fillColor('#18181b').text(movieTitle);
  doc.fontSize(11).fillColor('#52525b').text(`${theatreName}${theatreCity}`);
  if (showDate || showTime) {
    doc.fontSize(11).fillColor('#18181b').text(`Date & Time: ${showDate} at ${showTime}`);
  }
  doc.moveDown(1.5);

  // Horizontal divider
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e4e4e7').lineWidth(1).stroke();
  doc.moveDown(1.5);

  // Booking Details Grid
  const seatList = Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(', ') : (booking.seatNumbers || 'Assigned');
  const amount = booking.totalAmount ? `INR ${booking.totalAmount}` : 'Paid';

  doc.fontSize(12).fillColor('#18181b');
  doc.text(`Booking ID:  #${bookingIdStr.toUpperCase()}`);
  doc.text(`Seat(s):        ${seatList}`);
  doc.text(`Total Paid:     ${amount}`);
  doc.text(`Status:          CONFIRMED`);
  doc.moveDown(2);

  // Footer instructions
  const footerY = doc.y;
  doc.rect(50, footerY, 495, 45).fill('#f4f4f5');
  doc.fontSize(9).fillColor('#71717a').text(
    'Please present this digital or printed e-ticket at the cinema entrance.\nValid government photo ID may be required upon request.',
    55,
    footerY + 12,
    { align: 'center', width: 485 }
  );

  doc.end();
};

/**
 * Generates a PDF buffer (for email attachments).
 * Returns a Promise<Buffer>.
 */
export const generateTicketPdfBuffer = (booking, show) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const bookingIdStr = String(booking.bookingId || booking.id || booking._id || '');

    // Header Banner
    doc.rect(50, 45, 495, 60).fill('#09090b');
    doc.fontSize(22).fillColor('#10b981').text('CINEFLOW E-TICKET', 50, 62, { align: 'center' });
    doc.fontSize(9).fillColor('#a1a1aa').text('OFFICIAL DIGITAL ADMISSION PASS', 50, 88, { align: 'center' });
    doc.moveDown(3);

    const movieTitle = show?.movie?.title || 'Movie Ticket';
    const theatreName = show?.theatre?.name || 'Multiplex Cinema';
    const theatreCity = show?.theatre?.city ? `, ${show.theatre.city}` : '';
    const showDate = show?.showDate || '';
    const showTime = show?.showTime ? show.showTime.slice(0, 5) : '';

    doc.fontSize(18).fillColor('#18181b').text(movieTitle);
    doc.fontSize(11).fillColor('#52525b').text(`${theatreName}${theatreCity}`);
    if (showDate || showTime) {
      doc.fontSize(11).fillColor('#18181b').text(`Date & Time: ${showDate} at ${showTime}`);
    }
    doc.moveDown(1.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e4e4e7').lineWidth(1).stroke();
    doc.moveDown(1.5);

    const seatList = Array.isArray(booking.seatNumbers) ? booking.seatNumbers.join(', ') : (booking.seatNumbers || 'Assigned');

    doc.fontSize(12).fillColor('#18181b');
    doc.text(`Booking ID:  #${bookingIdStr.toUpperCase()}`);
    doc.text(`Seat(s):        ${seatList}`);
    doc.text(`Status:          CONFIRMED`);
    doc.moveDown(2);

    const footerY = doc.y;
    doc.rect(50, footerY, 495, 45).fill('#f4f4f5');
    doc.fontSize(9).fillColor('#71717a').text(
      'Please present this digital or printed e-ticket at the cinema entrance.\nValid government photo ID may be required upon request.',
      55,
      footerY + 12,
      { align: 'center', width: 485 }
    );

    doc.end();
  });
};
