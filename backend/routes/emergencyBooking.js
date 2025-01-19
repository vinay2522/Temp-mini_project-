const express = require('express');
const router = express.Router();
const EmergencyBooking = require('../models/EmergencyBooking');
const { v4: uuidv4 } = require('uuid');

// Create emergency booking
router.post('/create', async (req, res) => {
    try {
        const { 
            emergencyType, 
            latitude, 
            longitude, 
            address,
            ambulanceDetails
        } = req.body;
        
        // Validate required fields
        if (!emergencyType || !latitude || !longitude || !address || !ambulanceDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['emergencyType', 'latitude', 'longitude', 'address', 'ambulanceDetails']
            });
        }

        // Validate ambulance details
        if (!ambulanceDetails.vehicleNumber || 
            !ambulanceDetails.phoneNumber || 
            !ambulanceDetails.address || 
            !ambulanceDetails.coordinates) {
            return res.status(400).json({
                success: false,
                message: 'Missing required ambulance details',
                required: ['vehicleNumber', 'phoneNumber', 'address', 'coordinates']
            });
        }

        const bookingId = uuidv4();
        
        const emergencyBooking = new EmergencyBooking({
            emergencyType,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address
            },
            ambulanceDetails: {
                vehicleNumber: ambulanceDetails.vehicleNumber,
                phoneNumber: ambulanceDetails.phoneNumber,
                address: ambulanceDetails.address,
                coordinates: ambulanceDetails.coordinates
            },
            bookingId,
            status: 'ASSIGNED'
        });

        await emergencyBooking.save();

        res.status(201).json({
            success: true,
            bookingId,
            message: 'Emergency booking created successfully',
            booking: {
                id: bookingId,
                emergencyType,
                location: {
                    latitude,
                    longitude,
                    address
                },
                ambulanceDetails: {
                    vehicleNumber: ambulanceDetails.vehicleNumber,
                    phoneNumber: ambulanceDetails.phoneNumber,
                    address: ambulanceDetails.address,
                    coordinates: ambulanceDetails.coordinates
                },
                status: 'ASSIGNED'
            }
        });
    } catch (error) {
        console.error('Emergency booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create emergency booking',
            error: error.message
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
            bookingDetails: {
                id: booking.bookingId,
                emergencyType: booking.emergencyType,
                location: booking.location,
                ambulanceDetails: booking.ambulanceDetails,
                status: booking.status,
                createdAt: booking.createdAt
            }
        });
    } catch (error) {
        console.error('Get booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking status',
            error: error.message
        });
    }
});

// Update booking status
router.put('/status/:bookingId', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const booking = await EmergencyBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status;
        await booking.save();

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: {
                id: booking.bookingId,
                status: booking.status,
                updatedAt: booking.updatedAt
            }
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
});

module.exports = router;
