import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPhone, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';
import LoadingSpinner from './ui/LoadingSpinner';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: mobile, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    mobileNumber: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Format mobile number to match backend expectations
      const formattedMobile = formData.mobileNumber.startsWith('91') 
        ? formData.mobileNumber 
        : `91${formData.mobileNumber}`;

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`, {
        mobileNumber: formattedMobile
      });
      
      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        toast.success(response.data.message || 'OTP sent successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please enter new password');
      return;
    }

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
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-reset-otp`, {
        userId,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password reset successful!');
        navigate('/login', {
          state: {
            message: 'Password reset successful. Please login with your new password.'
          }
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('expired')) {
        setStep(1); // Go back to mobile input if OTP expired
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = handleOTPVerification; // Use the same handler for consistency

  const renderMobileForm = () => (
    <form onSubmit={handleMobileSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="mobileNumber" className="block mb-1 font-semibold text-sm sm:text-base">
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
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
            placeholder="Enter 10-digit mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-seva-red text-white py-2 px-4 rounded-md hover:bg-seva-red/90 transition duration-300 text-sm sm:text-base disabled:opacity-50"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  );

  const renderOTPForm = () => (
    <form onSubmit={handleOTPVerification} className="mt-8 space-y-6">
      <div>
        <label htmlFor="otp" className="block mb-1 font-semibold text-sm sm:text-base">
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
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block mb-1 font-semibold text-sm sm:text-base">
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
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-sm sm:text-base">
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
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-seva-red text-white py-2 px-4 rounded-md hover:bg-seva-red/90 transition duration-300 text-sm sm:text-base disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {loading && <LoadingSpinner fullScreen />}
      
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 && "Enter your registered mobile number"}
          {step === 2 && "Enter the OTP sent to your mobile"}
        </p>

        {step === 1 && renderMobileForm()}
        {step === 2 && renderOTPForm()}

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-sm font-medium text-seva-red hover:text-seva-red/90"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
