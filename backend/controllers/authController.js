const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../services/twilioService');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format mobile number
const formatMobileNumber = (number) => {
  const cleanNumber = number.toString().replace(/\D/g, '');
  return cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
};

// Initiate password reset
exports.forgotPassword = async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    
    // Format mobile number
    mobileNumber = formatMobileNumber(mobileNumber);
    
    // Find user
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this mobile number' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    try {
      // Try to send OTP first
      await sendOTP(mobileNumber, otp);

      // If OTP sent successfully, save it to user
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      res.json({ 
        success: true, 
        message: 'OTP sent successfully to your registered mobile number',
        userId: user._id 
      });
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please check your mobile number or try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process forgot password request' 
    });
  }
};

// Verify OTP
exports.verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successful. Please login with your new password.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
};
