import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { useAuth } from '../context/AuthContext';
import { FaLocationArrow } from 'react-icons/fa';
import { createDetailedBooking } from '../api/api';

const libraries = ['places', 'geometry', 'marker'];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 12.9716,
  lng: 77.5946 // Bangalore coordinates
};

// Base rates for different ambulance types
const BASE_RATES = {
  'BASIC': 15,
  'ADVANCED': 25,
  'ICU': 40
};

const ambulanceTypes = [
  { id: 'BASIC', name: 'Basic Ambulance', description: 'Standard medical equipment', baseRate: 15 },
  { id: 'ADVANCED', name: 'Advanced Life Support', description: 'Advanced medical equipment', baseRate: 25 },
  { id: 'ICU', name: 'Mobile ICU', description: 'Complete ICU setup', baseRate: 40 }
];

const AMBULANCE_DESCRIPTIONS = {
  'BASIC': 'Basic life support ambulance with essential medical equipment',
  'ADVANCED': 'Advanced life support with cardiac monitoring and oxygen',
  'ICU': 'Mobile ICU with ventilator and critical care equipment'
};

const DetailedBookingForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [directions, setDirections] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  const mapRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const hospitalAutocompleteRef = useRef(null);

  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientAge: '',
    contactNumber: '',
    bookingDate: new Date().toISOString().slice(0, 16),
    pickupLocation: '',
    hospitalName: '',
    hospitalAddress: '',
    bookingType: 'BASIC',
    additionalRequirements: {
      oxygenRequired: false,
      wheelchairRequired: false,
      stretcherRequired: false,
      nurseRequired: false
    },
    notes: ''
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const location = { lat, lng };
          setSelectedLocation(location);
          
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

          if (mapRef.current) {
            mapRef.current.panTo(location);
            mapRef.current.setZoom(15);
          }

          setLoading(false);
        },
        (error) => {
          setError('Error getting current location: ' + error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('additional.')) {
      const requirement = name.split('.')[1];
      setBookingData(prev => ({
        ...prev,
        additionalRequirements: {
          ...prev.additionalRequirements,
          [requirement]: checked
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

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
    const directionsService = new window.google.maps.DirectionsService();
    const distanceMatrixService = new window.google.maps.DistanceMatrixService();

    directionsService.route(
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

    distanceMatrixService.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      },
      (response, status) => {
        if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
          const element = response.rows[0].elements[0];
          if (element.distance && element.duration) {
            const distance = element.distance.value / 1000; // Convert to km
            const duration = element.duration.value / 60; // Convert to minutes
            const fare = calculateFare(distance, bookingData.bookingType);
            setDistanceInfo({ distance, duration, fare });
          } else {
            setError('Could not calculate distance and duration');
          }
        } else {
          setError('Failed to calculate distance');
        }
      }
    );
  }, [bookingData.bookingType]);

  const calculateFare = useCallback((distance, type) => {
    const baseRate = BASE_RATES[type] || BASE_RATES.BASIC;
    const baseFare = baseRate * distance;
    const gst = baseFare * 0.18; // 18% GST
    return Math.ceil(baseFare + gst);
  }, []);

  useEffect(() => {
    if (distanceInfo?.distance) {
      const newFare = calculateFare(distanceInfo.distance, bookingData.bookingType);
      setDistanceInfo(prev => ({
        ...prev,
        fare: newFare
      }));
    }
  }, [bookingData.bookingType, distanceInfo?.distance, calculateFare]);

  const handleAmbulanceTypeChange = (e) => {
    const newType = e.target.value;
    setBookingData(prev => ({
      ...prev,
      bookingType: newType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Please login to book an ambulance');
      return;
    }

    if (!selectedLocation || !hospitalLocation) {
      setError('Please select both pickup and drop locations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createDetailedBooking({
        patientName: bookingData.patientName,
        patientAge: parseInt(bookingData.patientAge),
        contactNumber: bookingData.contactNumber,
        bookingDate: new Date(bookingData.bookingDate),
        pickupLocation: {
          address: bookingData.pickupLocation,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        },
        dropLocation: {
          address: bookingData.hospitalAddress,
          latitude: hospitalLocation.lat,
          longitude: hospitalLocation.lng
        },
        distance: distanceInfo.distance,
        estimatedTime: distanceInfo.duration,
        bookingType: bookingData.bookingType,
        additionalRequirements: bookingData.additionalRequirements,
        notes: bookingData.notes,
        fare: distanceInfo.fare
      });

      if (response.success) {
        setSuccess(true);
        setBookingData({
          patientName: '',
          patientAge: '',
          contactNumber: '',
          bookingDate: new Date().toISOString().slice(0, 16),
          pickupLocation: '',
          hospitalName: '',
          hospitalAddress: '',
          bookingType: 'BASIC',
          additionalRequirements: {
            oxygenRequired: false,
            wheelchairRequired: false,
            stretcherRequired: false,
            nurseRequired: false
          },
          notes: ''
        });
        setSelectedLocation(null);
        setHospitalLocation(null);
        setDirections(null);
        setDistanceInfo(null);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
        Please login to access detailed booking.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64">Loading maps...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Detailed Ambulance Booking</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success ? (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Booking created successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={bookingData.patientName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Age</label>
              <input
                type="number"
                name="patientAge"
                value={bookingData.patientAge}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={bookingData.contactNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Date</label>
              <input
                type="datetime-local"
                name="bookingDate"
                value={bookingData.bookingDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

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
                    required
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
                  placeholder="Search for hospital"
                  value={bookingData.hospitalAddress}
                  onChange={(e) => setBookingData(prev => ({ ...prev, hospitalAddress: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </Autocomplete>
            </div>
          </div>

          <div className="mt-6 relative h-[400px] rounded-lg overflow-hidden">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
              onLoad={map => {
                mapRef.current = map;
              }}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  label={{
                    text: "P",
                    color: "white",
                    fontWeight: "bold"
                  }}
                  title="Pickup Location"
                />
              )}
              
              {hospitalLocation && (
                <Marker
                  position={hospitalLocation}
                  label={{
                    text: "D",
                    color: "white",
                    fontWeight: "bold"
                  }}
                  title="Drop Location"
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

            {distanceInfo && (
              <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Distance:</span>
                    <br />
                    {distanceInfo.distance.toFixed(2)} km
                  </div>
                  <div>
                    <span className="font-medium">Est. Time:</span>
                    <br />
                    {Math.ceil(distanceInfo.duration)} mins
                  </div>
                  <div>
                    <span className="font-medium">Est. Fare:</span>
                    <br />
                    ₹{distanceInfo.fare}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ambulance Type Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ambulance Type
            </label>
            <div className="space-y-4">
              {Object.entries(BASE_RATES).map(([type, rate]) => (
                <div key={type} className="flex items-start">
                  <input
                    type="radio"
                    id={type}
                    name="bookingType"
                    value={type}
                    checked={bookingData.bookingType === type}
                    onChange={handleAmbulanceTypeChange}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor={type} className="text-sm">
                    <div className="font-semibold">{type}</div>
                    <div className="text-gray-600">{AMBULANCE_DESCRIPTIONS[type]}</div>
                    <div className="text-green-600">Base Rate: ₹{rate}/km</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Distance and Fare Information */}
          {distanceInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Trip Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-semibold">{distanceInfo.distance.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Time</p>
                  <p className="font-semibold">{Math.ceil(distanceInfo.duration)} mins</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Estimated Fare</p>
                  <p className="font-bold text-xl text-green-600">₹{distanceInfo.fare}</p>
                  <p className="text-xs text-gray-500">*Includes 18% GST</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="additional.oxygenRequired"
                  checked={bookingData.additionalRequirements.oxygenRequired}
                  onChange={handleInputChange}
                  className="rounded text-blue-600"
                />
                <span>Oxygen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="additional.wheelchairRequired"
                  checked={bookingData.additionalRequirements.wheelchairRequired}
                  onChange={handleInputChange}
                  className="rounded text-blue-600"
                />
                <span>Wheelchair</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="additional.stretcherRequired"
                  checked={bookingData.additionalRequirements.stretcherRequired}
                  onChange={handleInputChange}
                  className="rounded text-blue-600"
                />
                <span>Stretcher</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="additional.nurseRequired"
                  checked={bookingData.additionalRequirements.nurseRequired}
                  onChange={handleInputChange}
                  className="rounded text-blue-600"
                />
                <span>Nurse</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
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
              {loading ? 'Processing...' : 'Book Ambulance'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DetailedBookingForm;
