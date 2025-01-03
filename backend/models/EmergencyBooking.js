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
  }
});

const EmergencyBooking = mongoose.model('EmergencyBooking', emergencyBookingSchema);
module.exports = EmergencyBooking;
