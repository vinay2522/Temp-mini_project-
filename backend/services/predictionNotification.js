const twilio = require('twilio');

// Initialize Twilio client outside function to avoid repeated initialization
const notificationTwilioClient = new twilio(
    process.env.NOTIFICATION_TWILIO_ACCOUNT_SID,
    process.env.NOTIFICATION_TWILIO_AUTH_TOKEN
);

// Verify phone number format and country code
const verifyPhoneNumber = (phoneNumber) => {
    // Remove any spaces or special characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Ensure it's a valid Indian mobile number (10 digits)
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+${cleaned}`;
    } else {
        throw new Error('Invalid phone number format. Must be 10 digits Indian mobile number.');
    }
};

// Cache message templates
const MESSAGE_TEMPLATES = {
    EMERGENCY: (data, additional) => `🚨 EMERGENCY BOOKING REQUEST\n\nType: ${data.type}\nLocation: ${data.location}\nCoordinates: ${data.coordinates}\nBooking ID: ${data.booking_id}\n\nAdditional Information:\nvehicle: ${additional.vehicle}\npickup: ${additional.pickup}\n\n⚠️ RESPONSE REQUIRED:\nReply "YES" to accept or "NO" to reject this booking.\n\nTime: ${new Date().toLocaleString()}`,

    ACCEPTED: (data) => `🔔 Booking ${data.status}\n${data.message}\n\nBooking ID: ${data.booking_id}\nPatient Location: ${data.patient_location}\n\nTime: ${new Date().toLocaleString()}`,

    REJECTED: (data) => `🔔 Booking ${data.status}\n${data.message}\n\nBooking ID: ${data.booking_id}\n\nTime: ${new Date().toLocaleString()}`,
    STATUS_UPDATE: (data, additional) => `🔔 Booking ${data.status}\n${data.message}\n\nBooking ID: ${additional.booking_id}\nPatient Location: ${additional.patient_location}\n\nTime: ${new Date().toLocaleString()}`
};

// Verify Twilio configuration
const verifyTwilioConfig = () => {
    const required = [
        'NOTIFICATION_TWILIO_ACCOUNT_SID',
        'NOTIFICATION_TWILIO_AUTH_TOKEN',
        'NOTIFICATION_TWILIO_PHONE_NUMBER'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing Twilio configuration: ${missing.join(', ')}`);
    }
};

// Function to send notification based on prediction
async function sendPredictionNotification(prediction, phoneNumber, additionalData = {}) {
    try {
        // Verify Twilio configuration
        verifyTwilioConfig();

        // Validate phone number
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length !== 10) {
            throw new Error('Invalid phone number format. Must be 10 digits.');
        }

        // Verify and format phone number
        const formattedPhone = verifyPhoneNumber(phoneNumber);
        
        // Get appropriate message template
        let messageBody;
        if (prediction.status) {
            messageBody = MESSAGE_TEMPLATES.STATUS_UPDATE(prediction, additionalData);
        } else {
            messageBody = MESSAGE_TEMPLATES.EMERGENCY(prediction, additionalData);
        }

        console.log('Attempting to send SMS:', {
            to: formattedPhone,
            from: process.env.NOTIFICATION_TWILIO_PHONE_NUMBER,
            messageLength: messageBody.length
        });

        // Send SMS using pre-initialized client
        const response = await notificationTwilioClient.messages.create({
            body: messageBody,
            to: formattedPhone,
            from: process.env.NOTIFICATION_TWILIO_PHONE_NUMBER
        });

        console.log('SMS sent successfully:', {
            sid: response.sid,
            status: response.status,
            direction: response.direction
        });

        return {
            success: true,
            data: response
        };

    } catch (error) {
        console.error('Prediction SMS Notification Error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            details: error.details
        });

        return {
            success: false,
            error: error.message,
            details: {
                code: error.code,
                moreInfo: error.details
            }
        };
    }
}

module.exports = {
    sendPredictionNotification
};
