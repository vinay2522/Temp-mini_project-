import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { useAuth } from '../context/AuthContext';
import { FaLocationArrow, FaMapMarkerAlt, FaHospital } from 'react-icons/fa';
import { createAuthenticatedAxios } from '../api/api';
import axios from 'axios';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 12.9716,
  lng: 77.5946 // Bangalore coordinates
};

const DetailedBookingForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [directions, setDirections] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [hospitalSearchBox, setHospitalSearchBox] = useState(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  const mapRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const hospitalAutocompleteRef = useRef(null);
  const directionsServiceRef = useRef(null);

  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientPhone: '',
    emergencyType: '',
    additionalNotes: '',
    pickupLocation: '',
    hospitalName: '',
    hospitalAddress: ''
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const emergencyTypes = [
    { id: 'cardiac', label: 'Cardiac Arrest', icon: '🫀' },
    { id: 'stroke', label: 'Stroke', icon: '🧠' },
    { id: 'accident', label: 'Accident', icon: '🚗' },
    { id: 'breathing', label: 'Breathing Problem', icon: '🫁' },
    { id: 'other', label: 'Other Emergency', icon: '🏥' },
  ];

  const getCurrentLocation = useCallback(() => {
    setIsUsingCurrentLocation(true);
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const location = { lat, lng };
          setSelectedLocation(location);
          
          // Get address from coordinates
          try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location });
            if (response.results[0]) {
              setBookingData(prev => ({
                ...prev,
                pickupLocation: response.results[0].formatted_address
              }));
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }

          // Center map on current location
          if (mapRef.current) {
            mapRef.current.panTo(location);
            mapRef.current.setZoom(15);
          }

          setLoading(false);
        },
        (error) => {
          setError('Error getting current location: ' + error.message);
          setLoading(false);
          setIsUsingCurrentLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setIsUsingCurrentLocation(false);
    }
  }, []);

  const handlePickupSelect = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setSelectedLocation(location);
        setBookingData(prev => ({
          ...prev,
          pickupLocation: place.formatted_address
        }));

        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        }

        if (hospitalLocation) {
          calculateRoute(location, hospitalLocation);
        }
      }
    }
  };

  const handleHospitalSelect = () => {
    if (hospitalAutocompleteRef.current) {
      const place = hospitalAutocompleteRef.current.getPlace();
      if (!place || !place.geometry) {
        setError('Please select a valid hospital location from the dropdown');
        return;
      }
      
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setHospitalLocation(location);
      setBookingData(prev => ({
        ...prev,
        hospitalName: place.name || '',
        hospitalAddress: place.formatted_address || ''
      }));

      if (mapRef.current) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(15);
      }

      if (selectedLocation) {
        calculateRoute(selectedLocation, location);
      }
    }
  };

  const calculateRoute = useCallback((origin, destination) => {
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          setError('Failed to calculate route');
        }
      }
    );
  }, []);

  const handleMapClick = useCallback((e) => {
    const clickedLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    // If we're selecting hospital location
    if (!hospitalLocation) {
      setHospitalLocation(clickedLocation);
      
      // Get address for clicked location
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: clickedLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setBookingData(prev => ({
            ...prev,
            hospitalName: 'Selected Hospital',
            hospitalAddress: results[0].formatted_address
          }));

          if (selectedLocation) {
            calculateRoute(selectedLocation, clickedLocation);
          }
        }
      });
    }
  }, [hospitalLocation, selectedLocation, calculateRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation || !hospitalLocation) {
      setError('Please select both pickup and hospital locations');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const authenticatedAxios = createAuthenticatedAxios();
      const response = await authenticatedAxios.post('/api/bookings', {
        patientName: bookingData.patientName,
        pickupLocation: bookingData.pickupLocation,
        pickupCoordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        },
        hospitalName: bookingData.hospitalName,
        hospitalAddress: bookingData.hospitalAddress,
        hospitalCoordinates: {
          lat: hospitalLocation.lat,
          lng: hospitalLocation.lng
        },
        patientPhone: bookingData.patientPhone,
        emergencyType: bookingData.emergencyType,
        additionalNotes: bookingData.additionalNotes || ''
      });

      setSuccess(true);
      // Reset form
      setBookingData({
        patientName: '',
        patientPhone: '',
        emergencyType: '',
        additionalNotes: '',
        pickupLocation: '',
        hospitalName: '',
        hospitalAddress: ''
      });
      setSelectedLocation(null);
      setHospitalLocation(null);
      setDirections(null);
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create booking. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64">Loading maps...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Book an Ambulance</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          Booking successful! Our team will contact you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
              <div className="mt-1 relative">
                <Autocomplete
                  onLoad={ref => (pickupAutocompleteRef.current = ref)}
                  onPlaceChanged={handlePickupSelect}
                >
                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={bookingData.pickupLocation}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </Autocomplete>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  <FaLocationArrow className={`${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital Location</label>
              <Autocomplete
                onLoad={ref => (hospitalAutocompleteRef.current = ref)}
                onPlaceChanged={handleHospitalSelect}
              >
                <input
                  type="text"
                  placeholder="Search for hospital or click on map"
                  value={bookingData.hospitalAddress}
                  onChange={(e) => setBookingData(prev => ({ ...prev, hospitalAddress: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </Autocomplete>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name</label>
              <input
                type="text"
                value={bookingData.patientName}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Phone</label>
              <input
                type="tel"
                value={bookingData.patientPhone}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientPhone: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Type</label>
              <select
                value={bookingData.emergencyType}
                onChange={(e) => setBookingData(prev => ({ ...prev, emergencyType: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select emergency type</option>
                {emergencyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={bookingData.additionalNotes}
                onChange={(e) => setBookingData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 relative h-[400px] rounded-lg overflow-hidden">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
              onClick={handleMapClick}
              onLoad={map => {
                mapRef.current = map;
              }}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  icon={{
                    url: '/images/pickup-marker.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              )}
              
              {hospitalLocation && (
                <Marker
                  position={hospitalLocation}
                  icon={{
                    url: '/images/hospital-marker.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              )}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: '#2563eb',
                      strokeWeight: 5
                    }
                  }}
                />
              )}
            </GoogleMap>
            <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
              <p className="text-sm text-gray-600">
                {!selectedLocation ? '1. Select pickup location using search or current location' :
                 !hospitalLocation ? '2. Click on the map or search to select hospital location' :
                 'Route calculated! Click Book Ambulance to proceed.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedLocation || !hospitalLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Booking...' : 'Book Ambulance'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DetailedBookingForm;
