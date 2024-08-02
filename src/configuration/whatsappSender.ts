// whatsapp.controller.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_AccountSid;
const authToken = process.env.TWILIO_Authtoken;
const client = twilio(accountSid, authToken);

export const sendWp = async (message: any, recipient = 'whatsapp:+919624670574') => {
  try {
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: recipient
    });
    console.log(`WhatsApp message sent: ${response.sid}`);
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
};

