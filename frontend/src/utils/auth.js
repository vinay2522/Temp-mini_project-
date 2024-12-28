import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};