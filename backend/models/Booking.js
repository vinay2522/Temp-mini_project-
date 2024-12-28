const mongoose = require('mongoose');

const ambulanceBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  emergencyType: {
    type: String,
    required: true,
    enum: ['MEDICAL', 'ACCIDENT', 'CARDIAC', 'PREGNANCY', 'OTHER']
  },
  additionalNotes: String,
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  }
}, { timestamps: true });

const transportBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropLocation: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  scheduleDate: {
    type: Date,
    required: true
  },
  requiresWheelchair: {
    type: Boolean,
    default: false
  },
  additionalNotes: String,
  status: {
    type: String,
    default: 'SCHEDULED',
    enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  }
}, { timestamps: true });

const consultationBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['GENERAL', 'EMERGENCY', 'FOLLOWUP', 'SPECIALIST']
  },
  preferredDate: {
    type: Date,
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  additionalNotes: String,
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  }
}, { timestamps: true });

const bloodRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  hospital: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['NORMAL', 'URGENT', 'EMERGENCY']
  },
  contactNumber: {
    type: String,
    required: true
  },
  additionalNotes: String,
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  }
}, { timestamps: true });

const AmbulanceBooking = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);
const TransportBooking = mongoose.model('TransportBooking', transportBookingSchema);
const ConsultationBooking = mongoose.model('ConsultationBooking', consultationBookingSchema);
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = {
  AmbulanceBooking,
  TransportBooking,
  ConsultationBooking,
  BloodRequest
};
