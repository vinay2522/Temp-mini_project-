import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const fetchData = async (url, method, data) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    const result = await response.json();
    return result;
};

// Submit contact form data
export const submitContact = (contactData) => {
    return fetchData(`${API_URL}/api/contact`, 'POST', contactData);
};

// Verify email
export const verifyEmail = (token) => {
    return fetchData(`${API_URL}/api/verify/${token}`, 'GET');
};

// Resend verification email
export const resendVerification = (email) => {
    return fetchData(`${API_URL}/api/resend-verification`, 'POST', { email });
};

// Create authenticated axios instance
export const createAuthenticatedAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};
