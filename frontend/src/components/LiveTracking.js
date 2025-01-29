import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import io from 'socket.io-client';
import { FaAmbulance, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const LiveTracking = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [directions, setDirections] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const defaultCenter = {
    lat: 20.5937, // Default to India's center
    lng: 78.9629
  };

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_BASE_URL);
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join-tracking-room', bookingId);
    });

    socket.on('driver-location-update', (data) => {
      setDriverLocation({
        lat: data.latitude,
        lng: data.longitude
      });
      updateDirections({
        lat: data.latitude,
        lng: data.longitude
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  // Fetch initial booking data
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/bookings/${bookingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBooking(response.data);
        if (response.data.driverLocation) {
          setDriverLocation({
            lat: response.data.driverLocation.latitude,
            lng: response.data.driverLocation.longitude
          });
        }
      } catch (err) {
        setError('Failed to fetch booking data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // Update directions when driver location changes
  const updateDirections = useCallback((newDriverLocation) => {
    if (!booking || !newDriverLocation) return;

    const directionsService = new window.google.maps.DirectionsService();

    const origin = new window.google.maps.LatLng(
      newDriverLocation.lat,
      newDriverLocation.lng
    );

    const destination = new window.google.maps.LatLng(
      booking.pickupLocation.latitude,
      booking.pickupLocation.longitude
    );

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          // Update estimated time
          const duration = result.routes[0].legs[0].duration.text;
          setEstimatedTime(duration);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [booking]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[500px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      {error}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Tracking</h2>
        
        {/* Status Panel */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <FaAmbulance className="text-green-500 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Ambulance</p>
                <p className="font-semibold">{booking?.ambulanceType || 'Standard'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-green-500 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-semibold">{booking?.destination || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaClock className="text-green-500 text-xl" />
              <div>
                <p className="text-sm text-gray-600">ETA</p>
                <p className="font-semibold">{estimatedTime || 'Calculating...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={driverLocation || defaultCenter}
            zoom={13}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                  url: '/ambulance-marker.png', // Add this icon to your public folder
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}

            {booking?.pickupLocation && (
              <Marker
                position={{
                  lat: booking.pickupLocation.latitude,
                  lng: booking.pickupLocation.longitude
                }}
                icon={{
                  url: '/pickup-marker.png', // Add this icon to your public folder
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#22C55E',
                    strokeWeight: 5
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default LiveTracking;
