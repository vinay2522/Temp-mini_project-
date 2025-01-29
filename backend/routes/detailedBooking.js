const express = require('express');
const router = express.Router();
const DetailedBooking = require('../models/DetailedBooking');
const { authenticateToken } = require('../middleware/auth');
const { checkFeature } = require('../config/features');

// Calculate fare based on distance and ambulance type
const calculateFare = (distance, bookingType) => {
    const baseRate = {
        'BASIC': 15,
        'ADVANCED': 25,
        'ICU': 40
    };
    
    const baseFare = baseRate[bookingType] * distance;
    const gst = baseFare * 0.18; // 18% GST
    return Math.ceil(baseFare + gst);
};

// Create a new detailed booking
router.post('/create', 
    authenticateToken, 
    checkFeature('detailedBooking.enabled'),
    async (req, res) => {
        try {
            const {
                patientName,
                patientAge,
                contactNumber,
                pickupLocation,
                dropLocation,
                distance,
                estimatedTime,
                bookingType,
                additionalRequirements,
                bookingDate,
                notes
            } = req.body;

            const fare = calculateFare(distance, bookingType);

            const booking = new DetailedBooking({
                userId: req.user.userId,
                patientName,
                patientAge,
                contactNumber,
                pickupLocation,
                dropLocation,
                distance,
                estimatedTime,
                bookingType,
                additionalRequirements,
                bookingDate: new Date(bookingDate),
                notes,
                fare,
                bookingId: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
            });

            const savedBooking = await booking.save();
            
            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: savedBooking
            });
        } catch (error) {
            console.error('Detailed booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    }
);

// Get user's bookings
router.get('/my-bookings', 
    authenticateToken,
    checkFeature('detailedBooking.enabled'),
    async (req, res) => {
        try {
            const bookings = await DetailedBooking.find({ userId: req.user.userId })
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                bookings: bookings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings',
                error: error.message
            });
        }
    }
);

// Get specific booking details
router.get('/:bookingId', 
    authenticateToken,
    checkFeature('detailedBooking.enabled'),
    async (req, res) => {
        try {
            const booking = await DetailedBooking.findOne({
                _id: req.params.bookingId,
                userId: req.user.userId
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                booking: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch booking details',
                error: error.message
            });
        }
    }
);

// Update booking status
router.patch('/:bookingId/status', 
    authenticateToken,
    checkFeature('detailedBooking.statusTracking'),
    async (req, res) => {
        try {
            const { status } = req.body;
            const booking = await DetailedBooking.findOneAndUpdate(
                { _id: req.params.bookingId, userId: req.user.userId },
                { bookingStatus: status },
                { new: true }
            );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                booking: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update booking status',
                error: error.message
            });
        }
    }
);

module.exports = router;
