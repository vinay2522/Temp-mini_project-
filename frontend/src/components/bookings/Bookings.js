import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaAmbulance, FaWheelchair, FaUserMd, FaHeart } from 'react-icons/fa';

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState({
    ambulance: [],
    transport: [],
    consultation: [],
    bloodRequests: []
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/bookings`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderBookingCard = (booking, type) => {
    const Icon = {
      ambulance: FaAmbulance,
      transport: FaWheelchair,
      consultation: FaUserMd,
      blood: FaHeart
    }[type];

    return (
      <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Icon className="w-6 h-6 text-gray-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">
                {booking.patientName}
              </h3>
              <p className="text-sm text-gray-500">
                {type === 'ambulance' || type === 'transport' ? (
                  <>From: {booking.pickupLocation}<br />To: {booking.dropLocation}</>
                ) : type === 'blood' ? (
                  <>Blood Type: {booking.bloodType} ({booking.units} units)</>
                ) : (
                  <>Type: {booking.consultationType}</>
                )}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Contact:</strong> {booking.contactNumber}
          </p>
          {booking.scheduleDate && (
            <p className="text-sm text-gray-600">
              <strong>Schedule:</strong> {formatDate(booking.scheduleDate)}
            </p>
          )}
          {booking.additionalNotes && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Notes:</strong> {booking.additionalNotes}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-xl text-gray-600">View and manage your service bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ambulance Bookings */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaAmbulance className="mr-2" /> Ambulance Bookings
            </h2>
            {bookings.ambulance.length > 0 ? (
              bookings.ambulance.map(booking => renderBookingCard(booking, 'ambulance'))
            ) : (
              <p className="text-gray-500">No ambulance bookings found</p>
            )}
          </div>

          {/* Transport Bookings */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaWheelchair className="mr-2" /> Transport Bookings
            </h2>
            {bookings.transport.length > 0 ? (
              bookings.transport.map(booking => renderBookingCard(booking, 'transport'))
            ) : (
              <p className="text-gray-500">No transport bookings found</p>
            )}
          </div>

          {/* Consultation Bookings */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaUserMd className="mr-2" /> Consultation Bookings
            </h2>
            {bookings.consultation.length > 0 ? (
              bookings.consultation.map(booking => renderBookingCard(booking, 'consultation'))
            ) : (
              <p className="text-gray-500">No consultation bookings found</p>
            )}
          </div>

          {/* Blood Requests */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaHeart className="mr-2" /> Blood Requests
            </h2>
            {bookings.bloodRequests.length > 0 ? (
              bookings.bloodRequests.map(booking => renderBookingCard(booking, 'blood'))
            ) : (
              <p className="text-gray-500">No blood requests found</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/book-ambulance')}
            className="px-6 py-3 bg-seva-red text-white rounded-lg hover:bg-seva-red/90"
          >
            Book Ambulance
          </button>
          <button
            onClick={() => navigate('/book-transport')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Transport
          </button>
          <button
            onClick={() => navigate('/book-consultation')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Book Consultation
          </button>
          <button
            onClick={() => navigate('/blood-request')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Request Blood
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
