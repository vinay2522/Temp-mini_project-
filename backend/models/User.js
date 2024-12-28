const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDriver: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  address: String,
  bio: String,
  avatar: String,
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    plateNumber: String
  }
}, {
  timestamps: true
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing password...');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored password exists:', !!this.password);
    
    if (!this.password || !candidatePassword) {
      console.log('Missing password data');
      return false;
    }

    // Use bcrypt.compare for secure comparison
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified or is new
    if (!this.isModified('password')) {
      console.log('Password not modified, skipping hash');
      return next();
    }

    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;