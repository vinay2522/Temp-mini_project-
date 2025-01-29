const express = require('express');
const router = express.Router();
const EmergencyBooking = require('../models/EmergencyBooking');
const { sendPredictionNotification } = require('../services/predictionNotification');
const twilio = require('twilio');

// Helper to validate Twilio request
const validateRequest = (req) => {
    const twilioSignature = req.headers['x-twilio-signature'];
    const params = req.body;
    const url = `${process.env.BASE_URL}/api/twilio/webhook`;  // Your webhook URL
    
    const requestIsValid = twilio.validateRequest(
        process.env.NOTIFICATION_TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        params
    );
    
    return requestIsValid;
};

// Webhook to handle SMS responses
router.post('/webhook', async (req, res) => {
    try {
        // Validate the request is from Twilio
        if (!validateRequest(req)) {
            console.error('Invalid Twilio request');
            return res.status(403).json({ error: 'Invalid request signature' });
        }

        const { From, Body, MessageSid } = req.body;
        const driverPhone = From.replace('+91', '');
        const response = Body.trim().toLowerCase();

        console.log('Received SMS response:', {
            from: From,
            body: Body,
            messageSid: MessageSid
        });

        // Find the latest pending booking for this driver
        const booking = await EmergencyBooking.findOne({
            'ambulanceDetails.phoneNumber': driverPhone,
            status: 'PENDING'
        }).sort({ createdAt: -1 });

        if (!booking) {
            console.log('No pending booking found for driver:', driverPhone);
            return res.status(404).send('No pending booking found');
        }

        let message;
        let newStatus;
        let statusDetails;

        if (response === 'yes' || response === 'y' || response === 'accept') {
            newStatus = 'ACCEPTED';
            statusDetails = 'Driver accepted the booking';
            message = `Thank you for accepting the emergency booking (ID: ${booking.bookingId}).\nPatient Location: ${booking.location.address}\nCoordinates: ${booking.location.latitude}, ${booking.location.longitude}`;
            
            // Update booking status
            await fetch(`${process.env.BASE_URL}/api/emergency-booking/status/${booking.bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    driverResponse: statusDetails
                })
            });

            // Send confirmation SMS to driver
            await sendPredictionNotification(
                { status: 'ACCEPTED', message: 'Booking confirmed' },
                driverPhone,
                {
                    booking_id: booking.bookingId,
                    patient_location: booking.location.address
                }
            );

        } else if (response === 'no' || response === 'n' || response === 'reject') {
            newStatus = 'REJECTED';
            statusDetails = 'Driver rejected the booking';
            message = `You have rejected the emergency booking (ID: ${booking.bookingId}). We will assign another ambulance.`;
            
            // Update booking status and trigger ML model
            await fetch(`${process.env.BASE_URL}/api/emergency-booking/status/${booking.bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    driverResponse: statusDetails
                })
            });

            // Send rejection confirmation to driver
            await sendPredictionNotification(
                { status: 'REJECTED', message: 'Booking rejected' },
                driverPhone,
                { booking_id: booking.bookingId }
            );

        } else {
            message = 'Please respond with YES to accept or NO to reject the booking.';
        }

        // Send TwiML response
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(message);
        
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Message status webhook
router.post('/message-status', async (req, res) => {
    try {
        const { MessageSid, MessageStatus, To } = req.body;
        
        console.log('Message Status Update:', {
            to: To,
            messageId: MessageSid,
            status: MessageStatus,
            timestamp: new Date().toISOString()
        });

        // Handle different status updates
        switch (MessageStatus) {
            case 'failed':
            case 'undelivered':
                console.error(`Message ${MessageSid} to ${To} ${MessageStatus}:`, req.body.ErrorMessage);
                break;
            case 'delivered':
                console.log(`Message ${MessageSid} successfully delivered to ${To}`);
                break;
            default:
                console.log(`Message ${MessageSid} status update: ${MessageStatus}`);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Message Status Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
