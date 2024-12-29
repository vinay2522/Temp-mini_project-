const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const multerUpload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Initialize Twilio client
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Format mobile number consistently with +91 prefix
const formatMobileNumber = (number) => {
  // Remove all non-digits
  const cleanNumber = number.toString().replace(/\D/g, '');
  // Get last 10 digits if number is longer
  const lastTenDigits = cleanNumber.slice(-10);
  // Add +91 prefix if not present
  return `+91${lastTenDigits}`;
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio
const sendOTP = async (mobileNumber, otp) => {
  try {
    console.log(`Sending OTP to ${mobileNumber}`);
    
    const message = await twilioClient.messages.create({
      body: `Your OTP for Seva Drive password reset is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });

    console.log(`SMS sent successfully. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Twilio Error:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    throw error;
  }
};

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    
    if (!mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Format and validate mobile number
    const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number'
      });
    }

    const formattedNumber = `+91${cleanNumber}`;
    
    // Check if user already exists
    let user = await User.findOne({ mobileNumber: formattedNumber });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this mobile number'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Create new user
    user = new User({
      mobileNumber: formattedNumber,
      password: password, // Will be hashed by the pre-save hook
      otp,
      otpExpiry,
      isVerified: false
    });

    await user.save();

    // Send OTP
    await sendOTP(formattedNumber, otp);

    res.json({
      success: true,
      message: 'Registration successful. Please verify your mobile number with the OTP sent.',
      userId: user._id.toString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Verify OTP for registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user with OTP fields explicitly selected
    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is expired
    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token for auto-login
    const token = jwt.sign(
      { 
        userId: user._id,
        mobileNumber: user.mobileNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Mobile number verified successfully',
      token,
      user: {
        userId: user._id,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    console.log('Login attempt for:', mobileNumber);

    // Format mobile number consistently
    const formattedNumber = formatMobileNumber(mobileNumber);
    console.log('Formatted mobile number:', formattedNumber);

    // Find user with password field
    const user = await User.findOne({ mobileNumber: formattedNumber }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Verify password directly with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    console.log('Login successful for user:', formattedNumber);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Update profile
router.post('/update-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.mobileNumber) {
      // Format mobile number before saving
      user.mobileNumber = formatMobileNumber(req.body.mobileNumber);
    }
    if (req.body.address) user.address = req.body.address;
    if (req.body.bio) user.bio = req.body.bio;

    await user.save();

    // Get account type
    let accountType = 'User';
    if (user.isAdmin) accountType = 'Admin';
    else if (user.isDriver) accountType = 'Driver';

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId: user._id.toString(),
        name: user.name,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        address: user.address,
        bio: user.bio,
        avatar: user.avatar,
        vehicleInfo: user.vehicleInfo,
        isDriver: user.isDriver,
        isAdmin: user.isAdmin,
        accountType: accountType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get account type
    let accountType = 'User';
    if (user.isAdmin) accountType = 'Admin';
    else if (user.isDriver) accountType = 'Driver';

    res.json({
      success: true,
      user: {
        userId: user._id.toString(),
        name: user.name,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        address: user.address,
        bio: user.bio,
        avatar: user.avatar,
        vehicleInfo: user.vehicleInfo,
        isDriver: user.isDriver,
        isAdmin: user.isAdmin,
        accountType: accountType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
});

// Upload avatar
router.post('/upload-avatar', authenticateToken, multerUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's avatar path
    user.avatar = '/uploads/' + req.file.filename;
    await user.save();

    // Get account type
    let accountType = 'User';
    if (user.isAdmin) accountType = 'Admin';
    else if (user.isDriver) accountType = 'Driver';

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: {
        userId: user._id.toString(),
        name: user.name,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        address: user.address,
        bio: user.bio,
        avatar: user.avatar,
        vehicleInfo: user.vehicleInfo,
        isDriver: user.isDriver,
        isAdmin: user.isAdmin,
        accountType: accountType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile picture'
    });
  }
});

// Forgot password - send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Format mobile number
    const fullMobileNumber = formatMobileNumber(mobileNumber);
    console.log('Processing request for:', fullMobileNumber);

    // Find user
    const user = await User.findOne({ mobileNumber: fullMobileNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this mobile number'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOTP(fullMobileNumber, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.'
    });
  }
});

// Reset password with OTP verification
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    console.log('Reset password request:', { userId, otp });

    // Find user with OTP fields
    const user = await User.findById(userId).select('+otp +otpExpiry +password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    console.log('Stored OTP:', user.otp, 'Received OTP:', otp);
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('Updating password for user:', user.mobileNumber);

    // Update password directly
    await User.findByIdAndUpdate(userId, {
      $set: { 
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    console.log('Password updated successfully');

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate and store new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOTP(user.mobileNumber, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
});

module.exports = router;
