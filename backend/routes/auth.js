const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const multerUpload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Initialize Twilio client if credentials are available
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Format mobile number consistently with +91 prefix
const formatMobileNumber = (number) => {
  // Remove all non-digits and get last 10 digits
  const cleanNumber = number.toString().replace(/\D/g, '').slice(-10);
  // Add +91 prefix if not present
  return cleanNumber.startsWith('+91') ? cleanNumber : `+91${cleanNumber}`;
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio or console.log for development
const sendOTP = async (mobileNumber, otp) => {
  try {
    if (!twilioClient) {
      // If Twilio is not configured, just log the OTP
      console.log('Development Mode - OTP for', mobileNumber, ':', otp);
      return true;
    }

    console.log('Sending OTP to:', mobileNumber);
    const message = await twilioClient.messages.create({
      body: `Your OTP for Seva Drive registration is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber
    });
    console.log('OTP sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;
    console.log('Registration request:', { mobileNumber });
    
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
    console.log('User registered:', formattedNumber);

    // Send OTP via SMS or log it
    const otpSent = await sendOTP(formattedNumber, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    console.log('OTP sent successfully for user:', formattedNumber);

    res.json({
      success: true,
      message: 'Registration successful. Please verify your mobile number with the OTP sent.',
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Registration error:', error);
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
    console.log('Verifying OTP for user:', userId, 'OTP:', otp);

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

    console.log('Found user:', user.mobileNumber, 'Stored OTP:', user.otp);

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

    console.log('User verified successfully:', user.mobileNumber);

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
    console.error('OTP verification error:', error);
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
    
    if (!mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and password are required'
      });
    }

    // Format mobile number
    const formattedNumber = formatMobileNumber(mobileNumber);
    console.log('Attempting login for:', formattedNumber);

    // Find user with password field
    const user = await User.findOne({ mobileNumber: formattedNumber }).select('+password');
    console.log('User search result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log('User not verified:', formattedNumber);
      return res.status(401).json({
        success: false,
        message: 'Please verify your mobile number first'
      });
    }

    // Compare password
    console.log('Comparing password for user:', formattedNumber);
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', formattedNumber);
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    console.log('Login successful for user:', formattedNumber);

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        mobileNumber: user.mobileNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      success: true,
      token,
      user: {
        userId: user._id.toString(),
        name: user.name,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
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
    console.error('Profile update error:', error);
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
    console.error('Profile fetch error:', error);
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
    console.error('Avatar upload error:', error);
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
    const formattedMobile = mobileNumber.toString().replace(/^(\+91|91)/, '').replace(/\D/g, '');
    const fullMobileNumber = `+91${formattedMobile}`;

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
    const otpSent = await sendOTP(fullMobileNumber, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    console.log('Reset OTP sent successfully for user:', user._id, 'OTP:', otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process request'
    });
  }
});

// Verify reset OTP and update password
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    console.log('Verifying reset OTP for user:', userId);

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, OTP, and new password are required'
      });
    }

    // Find user with OTP fields
    const user = await User.findById(userId).select('+otp +otpExpiry +password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user.mobileNumber, 'with OTP:', user.otp);

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      console.log('Invalid reset OTP for user:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      console.log('OTP expired for user:', userId);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Update user password directly
    console.log('Updating password for user:', userId);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    console.log('Password reset successful for user:', userId);

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Resending OTP for user:', userId);

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

    // Send OTP via SMS
    const otpSent = await sendOTP(user.mobileNumber, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    console.log('OTP resent successfully for user:', user.mobileNumber);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
});

module.exports = router;
