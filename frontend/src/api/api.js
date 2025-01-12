import axios from 'axios';

// Define base URL
const API_URL = 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Submit contact form data
export const submitContact = (contactData) => {
  return api.post('/api/contact', contactData);
};

// Verify email
export const verifyEmail = (token) => {
  return api.get(`/api/verify/${token}`);
};

// Resend verification email
export const resendVerification = (email) => {
  return api.post('/api/resend-verification', { email });
};

// Create emergency booking
export const createEmergencyBooking = async (bookingData) => {
  try {
    console.log('Creating emergency booking:', bookingData);
    const response = await api.post('/api/emergency-booking/create', bookingData);
    console.log('Emergency booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating emergency booking:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// Get emergency booking status
export const getEmergencyBookingStatus = async (bookingId) => {
  try {
    const response = await api.get(`/api/emergency-booking/status/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking status:', error);
    throw error;
  }
};

// Get ML model prediction for ambulance allocation
export const getPredictedAmbulance = async (userData) => {
  try {
    console.log('Sending prediction request:', userData);
    const response = await api.post('/predict', {
      user_latitude: userData.latitude,
      user_longitude: userData.longitude
    });
    console.log('Prediction response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting ambulance prediction:', error);
    throw error;
  }
};

// Detailed Booking APIs
export const createDetailedBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/detailed-booking/create', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating detailed booking:', error);
    throw error;
  }
};

export const getMyBookings = async () => {
  try {
    const response = await api.get('/api/detailed-booking/my-bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const response = await api.get(`/api/detailed-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.patch(`/api/detailed-booking/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};
