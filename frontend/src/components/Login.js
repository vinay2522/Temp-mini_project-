import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: location.state?.mobileNumber || '',
    password: ''
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      return;
    }

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      return;
    }

    let toastId = null;

    try {
      setLoading(true);
      
      // Show loading toast
      toastId = toast.loading('Logging in...', {
        position: "top-center",
        theme: "colored"
      });
      
      // Format mobile number for consistency
      const formattedMobile = formData.mobileNumber.startsWith('91') 
        ? formData.mobileNumber 
        : formData.mobileNumber.replace(/^(\+91|91)?/, '');

      await login(formattedMobile, formData.password);
      
      // Dismiss loading toast
      if (toastId) {
        toast.dismiss(toastId);
      }

      // Show success message
      toast.success('Login successful! Redirecting...', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });

      // Wait for toast to be visible before redirecting
      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectPath') || '/profile';
        localStorage.removeItem('redirectPath');
        navigate(redirectPath, { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Dismiss loading toast if it exists
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      // Show error toast
      toast.error(error.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      
      // Clear password field on error
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
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
