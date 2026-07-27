/**
 * SMS channel — Mock implementation.
 *
 * Logs SMS to console instead of sending real messages.
 * Replace body of `sendSms` with a Twilio/SNS call when ready:
 *
 *   import twilio from 'twilio';
 *   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 *   await client.messages.create({ body, from: process.env.TWILIO_FROM, to });
 */

/**
 * Send (or mock) an SMS.
 * @param {{ to: string, body: string }} options
 */
const sendSms = async ({ to, body }) => {
  console.log(`[SMS Channel] 📱 Mock SMS → ${to}`);
  console.log(`[SMS Channel]    Body: ${body}`);
};

export default { sendSms };
