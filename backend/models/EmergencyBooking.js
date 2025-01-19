const mongoose = require('mongoose');

const emergencyBookingSchema = new mongoose.Schema({
  emergencyType: {
    type: String,
    required: true,
    enum: ['cardiac', 'stroke', 'accident', 'breathing', 'other']
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  ambulanceDetails: {
    vehicleNumber: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
      }
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\(\d+\.?\d*,\s*\d+\.?\d*\)$/.test(v);
        },
        message: props => `${props.value} is not a valid coordinate format! Must be (lat, lng).`
      }
    }
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Define indexes in the schema options
  indexes: [
    { bookingId: 1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

const EmergencyBooking = mongoose.model('EmergencyBooking', emergencyBookingSchema);
module.exports = EmergencyBooking;
