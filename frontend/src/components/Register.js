import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    userId: null
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register, verifyOTP, resendOTP } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { mobileNumber, password, confirmPassword } = formData;

    // Validate mobile number
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return false;
    }

    // Validate password
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) return;
      
      setLoading(true);
      const response = await register({
        mobileNumber: formData.mobileNumber,
        password: formData.password
      });
      
      console.log('Registration response:', response);
      
      if (response.success) {
        setOtpData(prev => ({ ...prev, userId: response.userId }));
        setShowOtpInput(true);
        toast.success('OTP sent to your mobile number. Please verify.');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp || otpData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Submitting OTP:', otpData);
      const response = await verifyOTP(otpData.userId, otpData.otp);
      
      if (response.success) {
        // Store token if provided
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        toast.success('Mobile number verified successfully!');
        navigate('/login', { 
          state: { 
            mobileNumber: formData.mobileNumber,
            message: 'Registration successful! Please login to continue.'
          }
        });
      } else {
        toast.error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await resendOTP(otpData.userId);
      toast.success('OTP resent successfully!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {loading && <LoadingSpinner fullScreen />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          {showOtpInput ? 'Verify OTP' : 'Register'}
        </h2>

        {!showOtpInput ? (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="mobileNumber" className="block mb-1 font-semibold text-sm sm:text-base">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-semibold text-sm sm:text-base">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
                placeholder="Enter password (min. 6 characters)"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-sm sm:text-base">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-seva-red text-white py-2 px-4 rounded-md hover:bg-seva-red/90 transition duration-300 text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="otp" className="block mb-1 font-semibold text-sm sm:text-base">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otpData.otp}
                onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-seva-red hover:text-seva-red/90 font-semibold"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-seva-red text-white py-2 px-4 rounded-md hover:bg-seva-red/90 transition duration-300 text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-seva-red hover:text-seva-red/90 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;