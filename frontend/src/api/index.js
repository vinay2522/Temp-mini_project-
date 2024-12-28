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