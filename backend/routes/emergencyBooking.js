const express = require('express');
const router = express.Router();
const EmergencyBooking = require('../models/EmergencyBooking');
const { v4: uuidv4 } = require('uuid');
const { sendNotificationToDriver } = require('../services/firebaseService');

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

        // Create booking first
        const bookingId = uuidv4();
        const emergencyBooking = new EmergencyBooking({
            bookingId,
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
            status: 'PENDING'
        });

        await emergencyBooking.save();

        // Send notification to driver
        let notificationResult = { success: false, error: null };
        try {
            notificationResult = await sendNotificationToDriver(
                ambulanceDetails.phoneNumber,
                {
                    bookingId,
                    emergencyType,
                    location: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        address
                    }
                }
            );
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            notificationResult = { 
                success: false, 
                error: notificationError.message 
            };
        }

        // Return success response even if notification fails
        res.status(201).json({
            success: true,
            message: 'Emergency booking created successfully',
            data: {
                bookingId: emergencyBooking.bookingId,
                status: emergencyBooking.status,
                emergencyType: emergencyBooking.emergencyType,
                location: emergencyBooking.location,
                ambulanceDetails: {
                    vehicleNumber: emergencyBooking.ambulanceDetails.vehicleNumber,
                    phoneNumber: emergencyBooking.ambulanceDetails.phoneNumber,
                    address: emergencyBooking.ambulanceDetails.address
                }
            },
            notificationSent: notificationResult.success
        });

    } catch (error) {
        console.error('Error creating emergency booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating emergency booking',
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
        const { bookingId } = req.params;
        const { status, driverResponse } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const booking = await EmergencyBooking.findOne({ bookingId });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status;

        if (status === 'REJECTED' && driverResponse === 'REJECTED') {
            // Get new prediction from ML model for another ambulance
            try {
                const response = await fetch(`${process.env.ML_API_URL}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        latitude: booking.location.latitude,
                        longitude: booking.location.longitude
                    })
                });

                const newPrediction = await response.json();
                
                if (newPrediction.success) {
                    booking.ambulanceDetails = {
                        vehicleNumber: newPrediction.ambulance.vehicleNumber,
                        phoneNumber: newPrediction.ambulance.phoneNumber,
                        address: newPrediction.ambulance.address,
                        coordinates: newPrediction.ambulance.coordinates
                    };
                    
                    // Send notification to new driver
                    await sendNotificationToDriver(
                        newPrediction.ambulance.phoneNumber,
                        {
                            bookingId: booking.bookingId,
                            emergencyType: booking.emergencyType,
                            location: booking.location
                        }
                    );
                }
            } catch (error) {
                console.error('Error getting new prediction:', error);
            }
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
});

module.exports = router;
