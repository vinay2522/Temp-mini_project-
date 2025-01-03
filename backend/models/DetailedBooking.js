const mongoose = require('mongoose');

const detailedBookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        default: () => `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAge: {
        type: Number,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    pickupLocation: {
        address: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    dropLocation: {
        address: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    distance: {
        type: Number,  // in kilometers
        required: true
    },
    estimatedTime: {
        type: Number,  // in minutes
        required: true
    },
    bookingType: {
        type: String,
        enum: ['BASIC', 'ADVANCED', 'ICU'],
        required: true
    },
    additionalRequirements: {
        oxygenRequired: {
            type: Boolean,
            default: false
        },
        wheelchairRequired: {
            type: Boolean,
            default: false
        },
        stretcherRequired: {
            type: Boolean,
            default: false
        },
        nurseRequired: {
            type: Boolean,
            default: false
        }
    },
    bookingDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    fare: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

// Create compound index for user's bookings
detailedBookingSchema.index({ userId: 1, bookingDate: -1 });

const DetailedBooking = mongoose.model('DetailedBooking', detailedBookingSchema);

module.exports = DetailedBooking;
