import axios from 'axios';

const API = axios.create({ 
    baseURL: 'http://localhost:5000/api',
    withCredentials: true 
});

// Request interceptor for adding auth token
API.interceptors.request.use((req) => {
    const profile = localStorage.getItem('profile');
    if (profile) {
        req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`;
    }
    return req;
});

// Response interceptor for handling errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        throw error;
    }
);

// Auth APIs
export const register = (formData) => API.post('/register', formData);
export const login = (formData) => API.post('/login', formData);
export const getProfile = () => API.get('/profile');
export const updateProfile = (formData) => API.put('/profile', formData);

// Password Reset APIs
export const requestPasswordReset = (email) => 
    API.post('/reset-password-request', { email });
export const resetPassword = (resetData) => 
    API.post('/reset-password', resetData);

// Contact APIs
export const submitContactForm = (formData) => API.post('/contact', formData);

// Emergency Booking APIs
export const createEmergencyBooking = (bookingData) => 
    API.post('/emergency-booking/create', bookingData);

export const getEmergencyBookingStatus = (bookingId) => 
    API.get(`/emergency-booking/status/${bookingId}`);

// Function to poll booking status
export const pollBookingStatus = async (bookingId, onStatusChange) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for 5 minutes (5s interval)
    const interval = 5000; // 5 seconds

    const pollStatus = async () => {
        try {
            const response = await getEmergencyBookingStatus(bookingId);
            const status = response.data.status;
            
            // Call the callback with new status
            onStatusChange(status, response.data);

            // Stop polling if status is final
            if (status === 'ACCEPTED' || status === 'REJECTED' || status === 'CANCELLED') {
                return;
            }

            // Continue polling if not reached max attempts
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(pollStatus, interval);
            }
        } catch (error) {
            console.error('Error polling booking status:', error);
            // Continue polling even on error
            if (attempts < maxAttempts) {
                setTimeout(pollStatus, interval);
            }
        }
    };

    // Start polling
    pollStatus();
};