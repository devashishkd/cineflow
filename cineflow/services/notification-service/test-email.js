import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('Testing SMTP with:', process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'devilaldas746@gmail.com',
  subject: 'Test Email from Cineflow',
  text: 'If you are reading this, Gmail SMTP is working perfectly!'
}).then(info => {
  console.log('✅ Success! Message ID:', info.messageId);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error sending email:', err);
  process.exit(1);
});
