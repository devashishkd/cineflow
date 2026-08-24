import nodemailer from 'nodemailer';
import { generateTicketPdfBuffer } from '../../utils/pdf.js';
import showService from '../shows/show.service.js';

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
};

/**
 * Send an email using Nodemailer.
 * @param {{ to, subject, text, attachments? }} options
 */
const sendEmail = async ({ to, subject, text, attachments }) => {
  const from = process.env.SMTP_USER;
  if (!from || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP_USER / SMTP_PASS not set — skipping email.');
    return;
  }

  const mailOptions = { from, to, subject, text };
  if (attachments) mailOptions.attachments = attachments;

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`[Email] ✅ Sent to ${to} — ${info.messageId}`);
  } catch (err) {
    console.error('[Email] ❌ Error sending email:', err.message);
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send booking confirmation email with PDF e-ticket attachment.
 * Show details fetched directly from showService (no HTTP).
 */
export const sendBookingConfirmationEmail = async ({ to, bookingId, seatNumbers, showId, transactionId }) => {
  const seats = (seatNumbers || []).join(', ');

  const text = `🎉 Booking Confirmed!\n\nHi there! Your booking has been confirmed.\n\nDetails:\n- Booking ID: ${bookingId}\n- Seats: ${seats}\n- Transaction: ${transactionId}\n\nAttached is your E-Ticket PDF. Enjoy the movie! 🍿`;

  try {
    // Fetch show directly (no HTTP)
    const show = await showService.getShowById(showId);

    // Generate PDF buffer
    const pdfBuffer = await generateTicketPdfBuffer(
      { bookingId, seatNumbers },
      show
    );

    await sendEmail({
      to,
      subject: '🎬 Your Booking is Confirmed!',
      text,
      attachments: [{
        filename: `ticket-${bookingId.slice(0, 8)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
  } catch (err) {
    console.error('[Email] Failed to generate PDF — sending without attachment:', err.message);
    await sendEmail({ to, subject: '🎬 Your Booking is Confirmed!', text });
  }
};

/**
 * Send booking failure email.
 */
export const sendBookingFailureEmail = async ({ to, bookingId, reason }) => {
  const text = `❌ Booking Failed\n\nUnfortunately your booking could not be completed.\n\nDetails:\n- Booking ID: ${bookingId}\n- Reason: ${reason}\n\nYour seats have been released. Please try again.`;

  await sendEmail({ to, subject: '❌ Booking Failed', text });
};

export default { sendBookingConfirmationEmail, sendBookingFailureEmail };
