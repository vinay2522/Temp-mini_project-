import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Format mobile number consistently
const formatMobileNumber = (number) => {
  // Remove all non-digits and get last 10 digits
  return number.toString().replace(/\D/g, '').slice(-10);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  
  // Set authorization header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleError = (error) => {
    console.error('API Error:', error);
    let errorMessage;
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }
    
    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const fetchUserProfile = async () => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        return false;
      }

      const response = await axios.get('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
      return false;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUserProfile();
    }

    // Set up axios interceptor for token
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            localStorage.setItem('redirectPath', currentPath);
          }
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Format mobile number (remove any non-digits)
      const mobileNumber = userData.mobileNumber.replace(/\D/g, '');

      if (!mobileNumber || !userData.password) {
        throw new Error('Mobile number and password are required');
      }

      const response = await axios.post('/api/auth/register', {
        mobileNumber,
        password: userData.password
      });

      console.log('Registration response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobileNumber, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format mobile number
      const formattedNumber = formatMobileNumber(mobileNumber);
      
      // Validate mobile number format
      if (!/^[6-9]\d{9}$/.test(formattedNumber)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number');
      }

      // Validate password
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Attempting login with:', { mobileNumber: formattedNumber });

      // Clear any existing token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];

      // Make login request
      const response = await axios.post('/api/auth/login', {
        mobileNumber: formattedNumber,
        password
      });

      console.log('Login response:', response.data);

      // Handle successful login
      if (response.data && response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        // Store token and update headers
        localStorage.setItem('token', newToken);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Update user state
        setUser(userData);
        
        return {
          success: true,
          user: userData
        };
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Clear any existing token on error
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);

      console.error('Login error:', error.response || error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error('Invalid mobile number or password');
        }
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('/api/auth/update-profile', formData, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        '/api/auth/upload-avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${currentToken}`
          }
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        return response.data;
      }
      return { success: false, message: response.data.message || 'Failed to upload avatar' };
    } catch (error) {
      console.error('Avatar upload error:', error);
      if (error.response?.status === 401) {
        logout();
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to upload avatar'
      };
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Verifying OTP:', { userId, otp });
      const response = await axios.post('/api/auth/verify-otp', { userId, otp });

      console.log('OTP verification response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'OTP verification failed');
      }

      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/resend-otp', { userId });
      console.log('Resend OTP response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }

      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOTP = async (userId, otp, newPassword) => {
    try {
      console.log('Verifying reset OTP for userId:', userId);
      const response = await axios.post('/api/auth/verify-reset-otp', {
        userId,
        otp,
        newPassword
      });

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to verify reset OTP');
    } catch (error) {
      console.error('Reset OTP verification error:', error);
      throw error.response?.data || error;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,
    verifyResetOTP,
    updateProfile,
    uploadAvatar,
    fetchUserProfile,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;