import nodemailer from 'nodemailer';

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
};

/**
 * Send a plaintext email using Nodemailer.
 * @param {{ to: string, subject: string, text: string }} options
 */
const sendEmail = async ({ to, subject, text }) => {
  const from = process.env.SMTP_USER;
  
  if (!from || !process.env.SMTP_PASS) {
    console.warn('[Email Channel] SMTP_USER / SMTP_PASS not set — skipping email send.');
    return;
  }

  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text, // ONLY sending text, NO html to prevent spam filtering
    });
    console.log(`[Email Channel] ✅ Sent to ${to} — Message ID: ${info.messageId}`);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
};

export default { sendEmail };
