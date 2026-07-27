import emailChannel from '../channels/email.channel.js';
import axios from 'axios';
import PDFDocument from 'pdfkit';

const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';

const sendBookingConfirmationEmail = async ({ to, bookingId, seatNumbers, showId, transactionId }) => {
  const seats = (seatNumbers || []).join(', ');
  
  const text = `🎉 Booking Confirmed!

Hi there! Your booking has been confirmed.

Details:
- Booking ID: ${bookingId}
- Seats: ${seats}
- Transaction: ${transactionId}

Attached is your E-Ticket as a PDF. Enjoy the movie! 🍿`;

  let attachments = [];

  try {
    // 1. Fetch show details
    const res = await axios.get(`${MOVIE_SERVICE_URL}/api/shows/${showId}`);
    const show = res.data.data;

    // 2. Generate PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      
      attachments.push({
        filename: `ticket-${bookingId.slice(0,8)}.pdf`,
        content: pdfData,
        contentType: 'application/pdf'
      });

      // 3. Send Email with PDF
      await emailChannel.sendEmail({
        to,
        subject: '🎬 Your Booking is Confirmed!',
        text,
        attachments,
      });
    });

    // Build PDF
    doc.fontSize(24).fillColor('#14b8a6').text('Cineflow E-Ticket', { align: 'center' });
    doc.moveDown();
    
    if (show && show.movie) {
      doc.fontSize(20).fillColor('black').text(show.movie.title);
      doc.fontSize(12).fillColor('gray').text(`${show.theatre.name}, ${show.theatre.city}`);
      doc.text(`${show.showDate} | ${show.showTime}`);
      doc.moveDown();
    }

    doc.fontSize(14).fillColor('black').text(`Booking ID: ${bookingId.toUpperCase()}`);
    doc.text(`Seats: ${seats}`);
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text('Please show this ticket at the entrance.', { align: 'center' });
    doc.end();

    // The email is sent inside doc.on('end') so we return here
    return;
  } catch (err) {
    console.error('Failed to generate PDF for email:', err.message);
    // Fallback: send without attachment
    await emailChannel.sendEmail({
      to,
      subject: '🎬 Your Booking is Confirmed!',
      text,
    });
  }
};

const sendBookingFailureEmail = async ({ to, bookingId, reason }) => {
  const text = `❌ Booking Failed

Unfortunately your booking could not be completed.

Details:
- Booking ID: ${bookingId}
- Reason: ${reason}

Your seats have been released. Please try again.`;

  await emailChannel.sendEmail({
    to,
    subject: '❌ Booking Failed',
    text, // Passing ONLY text
  });
};

export default { sendBookingConfirmationEmail, sendBookingFailureEmail };
