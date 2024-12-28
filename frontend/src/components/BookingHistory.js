import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaAmbulance, FaClock, FaRupeeSign, FaSync } from 'react-icons/fa';
import { theme } from '../theme';

const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setError('User ID is required to fetch bookings');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/bookings/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Sort bookings by date (most recent first)
        const sortedBookings = response.data.sort((a, b) => 
          new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        setBookings(sortedBookings);
        setError('');
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response?.status === 404) {
        setBookings([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch booking history');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [fetchBookings, userId]);

  // Set up auto-refresh for active bookings
  useEffect(() => {
    const hasActiveBookings = bookings.some(
      booking => booking.status === 'active' || booking.status === 'pending'
    );

    if (hasActiveBookings && !refreshInterval) {
      const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else if (!hasActiveBookings && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [bookings, fetchBookings, refreshInterval]);

  const formatDate = (dateString) => {
    try {
      const options = { 
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      };
      return new Date(dateString).toLocaleString('en-IN', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        };
      case 'active':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center space-x-2 mx-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaSync className="animate-spin" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <FaAmbulance className="mx-auto text-gray-400 text-5xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
        <p className="text-gray-500">You haven't made any ambulance bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
        <button
          onClick={fetchBookings}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => {
          const statusColors = getStatusColor(booking.status);
          return (
            <div
              key={booking._id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${statusColors.border}`}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${statusColors.bg} rounded-full flex items-center justify-center`}>
                        <FaAmbulance className={`${statusColors.text} text-xl`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Booking #{booking._id.slice(-6)}
                      </h3>
                      <p className="text-gray-500">
                        <FaCalendarAlt className="inline mr-2" />
                        {formatDate(booking.bookingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        From: {booking.pickupLocation}
                      </p>
                      <p className="text-gray-600 flex items-center mt-2">
                        <FaMapMarkerAlt className="mr-2" />
                        To: {booking.dropLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <FaClock className="mr-2" />
                        Duration: {booking.duration || 'N/A'} mins
                      </p>
                      <p className="text-gray-600 flex items-center mt-2">
                        <FaRupeeSign className="mr-2" />
                        Fare: ₹{booking.fare || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {(booking.status === 'active' || booking.status === 'pending') && (
                    <button
                      onClick={() => window.location.href = `/tracking/${booking._id}`}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Track Ambulance
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingHistory;
