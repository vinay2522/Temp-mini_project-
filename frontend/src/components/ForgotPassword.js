import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPhone, FaKey, FaRedo } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'md' }) => (
  <div className="flex justify-center items-center">
    <div className={`animate-spin rounded-full h-${size === 'sm' ? 4 : 8} w-${size === 'sm' ? 4 : 8} border-b-2 border-white`}></div>
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const formattedMobile = formData.mobileNumber.startsWith('91') 
        ? formData.mobileNumber 
        : `91${formData.mobileNumber}`;

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`, {
        mobileNumber: formattedMobile
      });
      
      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        setResendTimer(60);
        toast.success('OTP sent successfully to your mobile number');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
      if (error.response?.status === 404) {
        setFormData(prev => ({ ...prev, mobileNumber: '' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/resend-otp`, {
        userId
      });
      
      if (response.data.success) {
        setResendTimer(60);
        setFormData(prev => ({ ...prev, otp: '' }));
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // Validate password
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`, {
        userId,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successful! Redirecting to login...', {
          autoClose: 3000
        });

        // Store mobile number for login
        const loginMobileNumber = formData.mobileNumber.replace(/^\+?91/, '');

        // Clear form data
        setFormData({
          mobileNumber: '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Wait for 3 seconds before redirecting
        setTimeout(() => {
          navigate('/login', {
            state: { 
              message: 'Your password has been reset successfully. Please login with your new password.',
              mobileNumber: loginMobileNumber
            }
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
      
      if (error.response?.status === 400 && error.response.data.message.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMobileForm = () => (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Reset Password</h2>
      <form onSubmit={handleMobileSubmit} className="space-y-6">
        <div>
          <label htmlFor="mobileNumber" className="block mb-2 text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              required
              maxLength="10"
              pattern="[0-9]{10}"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your 10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );

  const renderOTPForm = () => (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Reset Password</h2>
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block mb-2 text-sm font-medium text-gray-700">
            Enter OTP
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaKey className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="otp"
              name="otp"
              required
              maxLength="6"
              pattern="[0-9]{6}"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <FaRedo className="mr-1" />
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
            <span className="text-xs text-gray-500">
              OTP valid for 10 minutes
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaKey className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              minLength="6"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaKey className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength="6"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setFormData({
                mobileNumber: '',
                otp: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try with different mobile number
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      {step === 1 ? renderMobileForm() : renderOTPForm()}
    </div>
  );
};

export default ForgotPassword;
