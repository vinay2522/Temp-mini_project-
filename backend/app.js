const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

console.log('Environment loaded from:', path.join(__dirname, '.env'));
console.log('Environment variables loaded:', {
    NOTIFICATION_TWILIO_PHONE_NUMBER: process.env.NOTIFICATION_TWILIO_PHONE_NUMBER ? 'Set' : 'Not Set',
    NOTIFICATION_TWILIO_ACCOUNT_SID: process.env.NOTIFICATION_TWILIO_ACCOUNT_SID ? 'Set' : 'Not Set',
    NOTIFICATION_TWILIO_AUTH_TOKEN: process.env.NOTIFICATION_TWILIO_AUTH_TOKEN ? 'Set' : 'Not Set'
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const emergencyBookingRoutes = require('./routes/emergencyBooking');
const driverRoutes = require('./routes/driver');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve test page
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-notification.html'));
});

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/emergency-booking', emergencyBookingRoutes);
app.use('/api/driver', driverRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Add request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

// Check if port is in use
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test page available at: http://localhost:${PORT}/test`);
    console.log(`Public directory served at: http://localhost:${PORT}/static`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
