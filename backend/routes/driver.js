const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const admin = require('firebase-admin');
const twilio = require('twilio');
const path = require('path');

// Validate Twilio configuration
const TWILIO_CONFIG = {
    accountSid: process.env.NOTIFICATION_TWILIO_ACCOUNT_SID,
    authToken: process.env.NOTIFICATION_TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.NOTIFICATION_TWILIO_PHONE_NUMBER
};

// Initialize Twilio client for notifications
const notificationTwilioClient = twilio(
    TWILIO_CONFIG.accountSid,
    TWILIO_CONFIG.authToken
);

// Function to validate phone number
function validatePhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) {
        throw new Error('Invalid phone number format. Must be 10 digits.');
    }
    return cleanNumber;
}

// Function to send SMS using Twilio
async function sendSMS(phoneNumber, message) {
    try {
        // Validate Twilio configuration
        if (!TWILIO_CONFIG.phoneNumber || !TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
            console.error('Twilio configuration error:', {
                phoneNumber: !TWILIO_CONFIG.phoneNumber,
                accountSid: !TWILIO_CONFIG.accountSid,
                authToken: !TWILIO_CONFIG.authToken
            });
            throw new Error('Twilio configuration incomplete');
        }

        const formattedNumber = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
        
        console.log('Attempting to send SMS:', {
            to: formattedNumber,
            from: TWILIO_CONFIG.phoneNumber,
            messageLength: message.length
        });
        
        const response = await notificationTwilioClient.messages.create({
            body: message,
            from: TWILIO_CONFIG.phoneNumber,
            to: formattedNumber
        });

        console.log('SMS sent successfully:', {
            sid: response.sid,
            status: response.status,
            direction: response.direction
        });

        return { success: true, data: response };
    } catch (error) {
        console.error('Twilio SMS Error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            details: error.details,
            moreInfo: error.moreInfo
        });

        return { 
            success: false, 
            error: error.message,
            details: {
                code: error.code,
                moreInfo: error.moreInfo
            }
        };
    }
}

// Register FCM token for a driver
router.post('/register-token', async (req, res) => {
    try {
        const { fcmToken, phoneNumber, vehicleNumber } = req.body;

        if (!fcmToken || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'FCM token and phone number are required'
            });
        }

        // Clean phone number
        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhoneNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        // Subscribe to driver-specific topic
        const topic = `driver_${cleanPhoneNumber}`;
        try {
            await admin.messaging().subscribeToTopic(fcmToken, topic);
            console.log('Subscribed to topic:', topic);
        } catch (topicError) {
            console.error('Error subscribing to topic:', topicError);
        }

        // Update or create driver in database
        const driver = await Driver.findOneAndUpdate(
            { phoneNumber: cleanPhoneNumber },
            { 
                fcmToken,
                vehicleNumber: vehicleNumber || 'DEFAULT',
                isAvailable: true,
                updatedAt: new Date()
            },
            { 
                new: true,
                upsert: true
            }
        );

        console.log('Driver registered:', driver);
        
        res.json({
            success: true,
            message: 'Driver registered successfully',
            data: {
                phoneNumber: driver.phoneNumber,
                vehicleNumber: driver.vehicleNumber,
                isAvailable: driver.isAvailable,
                topic
            }
        });
    } catch (error) {
        console.error('Error registering driver:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Update driver location
router.post('/update-location', async (req, res) => {
    try {
        const { phoneNumber, latitude, longitude, address } = req.body;

        if (!phoneNumber || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and location are required'
            });
        }

        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        const driver = await Driver.findOneAndUpdate(
            { phoneNumber: cleanPhoneNumber },
            {
                lastLocation: {
                    latitude,
                    longitude,
                    address,
                    updatedAt: new Date()
                },
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: {
                phoneNumber: driver.phoneNumber,
                location: driver.lastLocation
            }
        });
    } catch (error) {
        console.error('Error updating driver location:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Update driver availability
router.post('/update-availability', async (req, res) => {
    try {
        const { phoneNumber, isAvailable } = req.body;

        if (!phoneNumber || typeof isAvailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Phone number and availability status are required'
            });
        }

        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        const driver = await Driver.findOneAndUpdate(
            { phoneNumber: cleanPhoneNumber },
            {
                isAvailable,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: 'Availability updated successfully',
            data: {
                phoneNumber: driver.phoneNumber,
                isAvailable: driver.isAvailable
            }
        });
    } catch (error) {
        console.error('Error updating driver availability:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Get driver details
router.get('/:phoneNumber', async (req, res) => {
    try {
        const cleanPhoneNumber = req.params.phoneNumber.replace(/[^0-9]/g, '');
        const driver = await Driver.findOne({ phoneNumber: cleanPhoneNumber });
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: {
                phoneNumber: driver.phoneNumber,
                vehicleNumber: driver.vehicleNumber,
                isAvailable: driver.isAvailable,
                lastLocation: driver.lastLocation
            }
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Test notification endpoint
router.post('/test-notification', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Validate phone number
        const cleanPhoneNumber = validatePhoneNumber(phoneNumber);

        // Create notification message
        const notificationText = `🚨 SevaDrive Alert: New booking request received at ${new Date().toLocaleString()}. Reply YES to accept or NO to decline.`;

        // Send SMS notification
        const smsResponse = await sendSMS(cleanPhoneNumber, notificationText);

        if (!smsResponse.success) {
            throw new Error(smsResponse.error || 'Failed to send SMS notification');
        }

        res.json({
            success: true,
            message: 'Notification sent successfully',
            data: {
                messageId: smsResponse.data.sid,
                method: 'sms',
                phoneNumber: cleanPhoneNumber
            }
        });
    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            details: error.details || {}
        });
    }
});

// Handle SMS replies (webhook endpoint for Twilio)
router.post('/sms-webhook', express.json(), async (req, res) => {
    try {
        const { From, Body, MessageSid } = req.body;
        console.log('Received SMS reply:', { From, Body, MessageSid });

        // Extract phone number without country code
        const phoneNumber = From.replace('+91', '');

        // Process the response
        const response = Body.trim().toUpperCase();
        let status;

        if (response === 'YES') {
            status = 'ACCEPTED';
        } else if (response === 'NO') {
            status = 'REJECTED';
        } else {
            // Invalid response
            await sendSMS(phoneNumber, '❌ Invalid response. Please reply with YES to accept or NO to decline.');
            return res.status(400).json({
                success: false,
                message: 'Invalid response'
            });
        }

        // Update driver status
        await Driver.findOneAndUpdate(
            { phoneNumber },
            { 
                $set: {
                    isAvailable: status === 'ACCEPTED',
                    lastResponseTime: new Date(),
                    lastResponseStatus: status
                }
            }
        );

        // Send confirmation message
        const confirmationMessage = status === 'ACCEPTED' 
            ? '✅ Thank you for accepting the booking. You will receive the details shortly.'
            : '❌ Booking declined. You will be notified of future bookings.';
        
        await sendSMS(phoneNumber, confirmationMessage);

        res.json({
            success: true,
            message: 'SMS reply processed successfully',
            data: { status, phoneNumber }
        });
    } catch (error) {
        console.error('Error processing SMS reply:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
