import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Pre-fill mobile number if coming from registration
  React.useEffect(() => {
    if (location.state?.mobileNumber) {
      setFormData(prev => ({
        ...prev,
        mobileNumber: location.state.mobileNumber
      }));
      
      if (location.state?.message) {
        toast.success(location.state.message);
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(''); // Clear error when user types
    
    if (name === 'mobileNumber') {
      // Only allow numbers and limit to 10 digits
      const cleanValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    // Clear previous errors
    setError('');

    const { mobileNumber, password } = formData;

    // Validate mobile number (10 digits starting with 6-9)
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return false;
    }

    // Validate password
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) return;
      
      setLoading(true);
      setError('');
      
      const response = await login(formData.mobileNumber, formData.password);
      
      if (response.success) {
        toast.success('Login successful!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      toast.error(error.message || 'Login failed');
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
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

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
              placeholder="Enter 10-digit mobile number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
              required
              maxLength="10"
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
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seva-red"
              required
              minLength="6"
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-seva-red hover:text-seva-red/80 text-sm sm:text-base"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-seva-red text-white py-2 px-4 rounded-md hover:bg-seva-red/90 transition duration-300 text-sm sm:text-base disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm sm:text-base">
            Don't have an account?{' '}
            <Link to="/register" className="text-seva-red hover:text-seva-red/80">
              Register here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
