const express = require('express');
const router = express.Router();
const EmergencyBooking = require('../models/EmergencyBooking');
const { v4: uuidv4 } = require('uuid');
const { sendPredictionNotification } = require('../services/predictionNotification');

// Simulated ML model prediction (replace with your actual ML model)
const predictNextAmbulance = async (booking) => {
    // Simulated delay to represent ML processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated ambulance data (replace with actual ML prediction)
    const ambulances = [
        {
            vehicleNumber: 'KA01AE8845',
            phoneNumber: '9632598431',
            address: '84J3+25C, Kodlapura, Shanti Nagar, Tumakuru, Karnataka 572102, India',
            coordinates: '(13.32992, 77.10273)'
        },
        {
            vehicleNumber: 'KA01AE8846',
            phoneNumber: '9632598432',
            address: '84J3+25C, Kodlapura, Shanti Nagar, Tumakuru, Karnataka 572102, India',
            coordinates: '(13.32993, 77.10274)'
        }
    ];

    // Randomly select next ambulance (replace with actual ML logic)
    const nextAmbulance = ambulances[Math.floor(Math.random() * ambulances.length)];
    return nextAmbulance;
};

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

        // Create booking ID first
        const bookingId = uuidv4();

        // Create booking object
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
            status: 'PENDING',
            statusHistory: [{
                status: 'PENDING',
                timestamp: new Date(),
                details: 'Booking created, waiting for driver response'
            }]
        });

        // Save booking first to ensure data consistency
        const savedBooking = await emergencyBooking.save();

        // Send notification with retry logic
        let notificationResult = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries && (!notificationResult || !notificationResult.success)) {
            try {
                notificationResult = await sendPredictionNotification(
                    {
                        type: emergencyType.toUpperCase(),
                        location: address,
                        coordinates: `${latitude}, ${longitude}`,
                        booking_id: bookingId
                    },
                    ambulanceDetails.phoneNumber,
                    {
                        vehicle: ambulanceDetails.vehicleNumber,
                        pickup: ambulanceDetails.address
                    }
                );

                if (!notificationResult.success) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                    }
                }
            } catch (error) {
                console.error(`SMS notification attempt ${retryCount + 1} failed:`, error);
                retryCount++;
                if (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                }
            }
        }

        // Log notification status
        console.log('Final notification status:', {
            success: notificationResult?.success || false,
            retryCount,
            bookingId
        });

        // Return response
        res.status(201).json({
            success: true,
            message: 'Emergency booking created successfully',
            data: {
                bookingId: savedBooking.bookingId,
                status: savedBooking.status,
                emergencyType: savedBooking.emergencyType,
                location: savedBooking.location,
                ambulanceDetails: {
                    vehicleNumber: savedBooking.ambulanceDetails.vehicleNumber,
                    phoneNumber: savedBooking.ambulanceDetails.phoneNumber,
                    address: savedBooking.ambulanceDetails.address
                }
            },
            notification: {
                sent: notificationResult?.success || false,
                retryCount,
                error: notificationResult?.error
            }
        });

    } catch (error) {
        console.error('Emergency Booking Error:', error);
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
            data: {
                bookingId: booking.bookingId,
                status: booking.status,
                statusHistory: booking.statusHistory,
                emergencyType: booking.emergencyType,
                location: booking.location,
                ambulanceDetails: {
                    vehicleNumber: booking.ambulanceDetails.vehicleNumber,
                    phoneNumber: booking.ambulanceDetails.phoneNumber,
                    address: booking.ambulanceDetails.address
                }
            }
        });
    } catch (error) {
        console.error('Error getting booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting booking status',
            error: error.message
        });
    }
});

// Update booking status (called by webhook)
router.put('/status/:bookingId', async (req, res) => {
    try {
        const { status, driverResponse } = req.body;
        const booking = await EmergencyBooking.findOne({ bookingId: req.params.bookingId });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update status
        booking.status = status;
        booking.statusHistory.push({
            status,
            timestamp: new Date(),
            details: driverResponse || `Status updated to ${status}`
        });

        // If rejected, try to find another ambulance
        if (status === 'REJECTED') {
            try {
                const newPrediction = await predictNextAmbulance(booking);
                
                if (newPrediction) {
                    // Update booking with new ambulance details
                    booking.ambulanceDetails = {
                        vehicleNumber: newPrediction.vehicleNumber,
                        phoneNumber: newPrediction.phoneNumber,
                        address: newPrediction.address,
                        coordinates: newPrediction.coordinates
                    };
                    booking.status = 'PENDING';
                    booking.statusHistory.push({
                        status: 'PENDING',
                        timestamp: new Date(),
                        details: 'New ambulance assigned'
                    });

                    // Send notification to new driver
                    const emergencyData = {
                        type: booking.emergencyType.toUpperCase(),
                        location: booking.location.address,
                        coordinates: `${booking.location.latitude}, ${booking.location.longitude}`,
                        booking_id: booking.bookingId
                    };

                    const additionalData = {
                        vehicle: newPrediction.vehicleNumber,
                        pickup: newPrediction.address
                    };

                    await sendPredictionNotification(
                        emergencyData,
                        newPrediction.phoneNumber,
                        additionalData
                    );
                }
            } catch (error) {
                console.error('Error finding new ambulance:', error);
            }
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: {
                bookingId: booking.bookingId,
                status: booking.status,
                statusHistory: booking.statusHistory,
                ambulanceDetails: booking.ambulanceDetails
            }
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
