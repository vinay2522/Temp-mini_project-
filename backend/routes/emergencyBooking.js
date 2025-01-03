const express = require('express');
const router = express.Router();
const EmergencyBooking = require('../models/EmergencyBooking');
const { v4: uuidv4 } = require('uuid');

// Create emergency booking
router.post('/create', async (req, res) => {
    try {
        const { emergencyType, latitude, longitude, address } = req.body;
        
        const bookingId = uuidv4();
        
        const emergencyBooking = new EmergencyBooking({
            emergencyType,
            location: {
                latitude,
                longitude,
                address
            },
            bookingId
        });

        await emergencyBooking.save();

        res.status(201).json({
            success: true,
            bookingId,
            message: 'Emergency booking created successfully'
        });
    } catch (error) {
        console.error('Emergency booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create emergency booking'
        });
    }
});

// Get booking status
router.get('/status/:bookingId', async (req, res) => {
    try {
        const booking = await EmergencyBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            status: booking.status,
            bookingDetails: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking status'
        });
    }
});

module.exports = router;
