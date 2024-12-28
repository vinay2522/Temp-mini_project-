const mongoose = require('mongoose');

const bloodDonationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65
  },
  weight: {
    type: Number,
    required: true,
    min: 45
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  lastDonationDate: Date,
  medicalConditions: [String],
  medications: [String],
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED']
  },
  preferredDate: {
    type: Date,
    required: true
  },
  additionalNotes: String
}, { timestamps: true });

const bloodInventorySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const bloodCompatibilitySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  canDonateTo: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }],
  canReceiveFrom: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }]
});

const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);
const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
const BloodCompatibility = mongoose.model('BloodCompatibility', bloodCompatibilitySchema);

module.exports = {
  BloodDonation,
  BloodInventory,
  BloodCompatibility
};
