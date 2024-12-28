const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Send OTP via Twilio
exports.sendOTP = async (mobileNumber, otp) => {
  try {
    // Format mobile number to include +91 if not present
    const formattedNumber = mobileNumber.startsWith('+') 
      ? mobileNumber 
      : `+${mobileNumber}`;

    const message = await twilioClient.messages.create({
      body: `Your Seva Drive verification code is: ${otp}. Valid for 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('OTP sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};
