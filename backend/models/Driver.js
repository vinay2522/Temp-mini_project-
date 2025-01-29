const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    fcmToken: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    lastLocation: {
        type: {
            latitude: Number,
            longitude: Number,
            address: String,
            updatedAt: Date
        },
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
driverSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Driver', driverSchema);
