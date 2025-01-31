import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { 
  GoogleMap, 
  useJsApiLoader, 
  DirectionsRenderer, 
  MarkerF,
  OverlayView,
  InfoWindowF
} from '@react-google-maps/api'
import { createEmergencyBooking, getEmergencyBookingStatus, getPredictedAmbulance } from '../api/api'
import { toast } from 'react-toastify'

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  transition: 'all 0.3s ease-in-out'
}

const wideMapStyle = {
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: 'white'
};

const normalMapStyle = {
  width: '100%',
  height: '400px',
  position: 'relative',
  borderRadius: '8px',
  overflow: 'hidden'
};

const expandButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1000,
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const libraries = ['places', 'geometry', 'marker']

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
}

const mapControlsStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  zIndex: 2000,
  display: 'flex',
  gap: '0.5rem'
};

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [isWideMap, setIsWideMap] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [directions, setDirections] = useState(null)
  const [ambulanceDetails, setAmbulanceDetails] = useState(null)
  const [ambulanceLocation, setAmbulanceLocation] = useState(null)
  const [routeDetails, setRouteDetails] = useState(null)
  const [bookingData, setBookingData] = useState({
    emergencyType: '',
    latitude: null,
    longitude: null,
    address: ''
  })
  const [userLocation, setUserLocation] = useState(null)
  const [ambulancePhoneLocation, setAmbulancePhoneLocation] = useState(null)
  const [liveLocation, setLiveLocation] = useState(null)
  const [showTrackButton, setShowTrackButton] = useState(true);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(0)
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('PENDING');
  const [driverLocation, setDriverLocation] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const mapRef = useRef(null)
  const trackingIntervalRef = useRef(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAL9FKmHqjFf8uH9svsTzD43QwZ00dvqNE',
    libraries,
  })

  const center = useMemo(() => ({
    lat: bookingData.latitude || defaultCenter.lat,
    lng: bookingData.longitude || defaultCenter.lng
  }), [bookingData.latitude, bookingData.longitude])

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    if (bookingData.latitude && bookingData.longitude && ambulanceLocation) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend({ lat: parseFloat(bookingData.latitude), lng: parseFloat(bookingData.longitude) })
      bounds.extend(ambulanceLocation)
      map.fitBounds(bounds)
    }
  }, [bookingData.latitude, bookingData.longitude, ambulanceLocation])

  const interpolatePosition = useCallback((start, end, fraction) => {
    return {
      lat: start.lat + (end.lat - start.lat) * fraction,
      lng: start.lng + (end.lng - start.lng) * fraction
    };
  }, []);

  const startLiveTracking = async () => {
    if (!ambulanceDetails?.contactNumber) {
      console.error('No ambulance contact number available');
      return;
    }
    
    setIsTracking(true);
    
    // Simulating getting phone location - Replace this with actual phone location API
    // This is where you would integrate with your phone location tracking service
    const trackPhoneLocation = async () => {
      try {
        // Replace this with actual API call to get phone location
        const response = await fetch(`/api/track-phone/${ambulanceDetails.contactNumber}`);
        const location = await response.json();
        
        if (location && location.lat && location.lng) {
          setAmbulancePhoneLocation(location);
          setLiveLocation(location);
          
          if (userLocation) {
            calculateRouteDistance();
          }
        }
      } catch (error) {
        console.error('Error tracking phone location:', error);
        setIsTracking(false);
      }
    };
    
    // Only track if we're still in tracking mode
    if (isTracking) {
      const intervalId = setInterval(trackPhoneLocation, 5000); // Update every 5 seconds
      return () => {
        clearInterval(intervalId);
        setIsTracking(false);
      };
    }
  };

  const calculateRouteDistance = useCallback(() => {
    if (!bookingData.latitude || !bookingData.longitude || !ambulanceLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: parseFloat(bookingData.latitude), lng: parseFloat(bookingData.longitude) },
        destination: ambulanceLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
        }
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const route = result.routes[0];
          if (route && route.legs[0]) {
            setRouteDetails({
              distance: route.legs[0].distance.text,
              duration_in_traffic: route.legs[0].duration_in_traffic.text,
              traffic_percentage: Math.round((route.legs[0].duration_in_traffic.value / route.legs[0].duration.value - 1) * 100)
            });
          }
        } else {
          console.error('Error calculating route:', status);
        }
      }
    );
  }, [bookingData.latitude, bookingData.longitude, ambulanceLocation]);

  useEffect(() => {
    if (isLoaded && bookingData.latitude && bookingData.longitude && ambulanceLocation) {
      calculateRouteDistance();
    }
  }, [isLoaded, bookingData.latitude, bookingData.longitude, ambulanceLocation, calculateRouteDistance]);

  const handleTrackAmbulance = () => {
    setIsTracking(true);
    setShowMap(true);
    setShowTrackButton(false);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setShowMap(false);
    setShowTrackButton(true);
    setIsWideMap(false);
    setSelectedMarker(null);
  };

  const handleMapExpand = () => {
    setIsWideMap(true);
    // When expanding, we want to recenter the map
    if (mapRef.current) {
      const map = mapRef.current;
      window.google.maps.event.trigger(map, 'resize');
      if (center) {
        map.panTo(center);
      }
    }
  };

  const handleMapShrink = () => {
    setIsWideMap(false);
    // When shrinking, we want to recenter the map
    if (mapRef.current) {
      const map = mapRef.current;
      window.google.maps.event.trigger(map, 'resize');
      if (center) {
        map.panTo(center);
      }
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setShowTrackButton(true);
    setSelectedMarker(null);
    setIsWideMap(false);
  };

  const handleMarkerClick = (markerType) => {
    setSelectedMarker(markerType);
    setShowInfoWindow(true);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
    setShowInfoWindow(false);
  };

  const calculateRoute = (origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess'
        },
        optimizeWaypoints: true
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };

  useEffect(() => {
    if (ambulanceDetails && ambulanceDetails.ambulance_coordinates) {
      const coords = ambulanceDetails.ambulance_coordinates
        .replace('(', '')
        .replace(')', '')
        .split(',')
        .map(coord => parseFloat(coord.trim()));
      
      setAmbulanceLocation({ lat: coords[0], lng: coords[1] });
    }
  }, [ambulanceDetails]);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: true,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
  };

  const renderMap = () => {
    if (!isLoaded) return 'Loading maps...';
    if (loadError) return 'Error loading maps';

    return (
      <div style={isWideMap ? wideMapStyle : normalMapStyle}>
        <div style={mapControlsStyle}>
          {isWideMap ? (
            <button
              onClick={handleMapShrink}
              className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Shrink Map</span>
            </button>
          ) : (
            <button
              onClick={handleMapExpand}
              className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Expand Map</span>
            </button>
          )}
          <button
            onClick={handleCloseMap}
            className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Close Map</span>
          </button>
        </div>
        
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Route Display */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#2563eb',
                  strokeWeight: 4,
                  zIndex: 1
                }
              }}
            />
          )}

          {/* User Location Marker */}
          {bookingData.latitude && bookingData.longitude && (
            <MarkerF
              position={{
                lat: parseFloat(bookingData.latitude),
                lng: parseFloat(bookingData.longitude)
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
              }}
              label={{
                text: "Your Location",
                className: "marker-label",
                color: "black",
                fontSize: "14px",
                fontWeight: "bold"
              }}
              onClick={() => setSelectedMarker('user')}
              zIndex={3}
            />
          )}

          {/* Ambulance Location Marker */}
          {ambulanceLocation && (
            <MarkerF
              position={ambulanceLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
              }}
              label={{
                text: `Ambulance ${ambulanceDetails?.vehicleNumber}`,
                className: "marker-label",
                color: "black",
                fontSize: "14px",
                fontWeight: "bold"
              }}
              onClick={() => setSelectedMarker('ambulance')}
              zIndex={3}
            />
          )}

          {/* Driver Location Marker */}
          {driverLocation && (
            <MarkerF
              position={driverLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
              }}
              label={{
                text: "Driver Location",
                className: "marker-label",
                color: "black",
                fontSize: "14px",
                fontWeight: "bold"
              }}
              zIndex={3}
            />
          )}

          {/* Custom Info Overlay */}
          {selectedMarker && (
            <OverlayView
              position={
                selectedMarker === 'user'
                  ? {
                      lat: parseFloat(bookingData.latitude),
                      lng: parseFloat(bookingData.longitude)
                    }
                  : selectedMarker === 'ambulance'
                    ? ambulanceLocation
                    : driverLocation
              }
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={(width, height) => ({
                x: -(width / 2),
                y: -height - 10
              })}
            >
              <div
                style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  minWidth: '200px',
                  position: 'relative'
                }}
              >
                <button
                  onClick={() => setSelectedMarker(null)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  paddingRight: '20px'
                }}>
                  {selectedMarker === 'user' ? 'Your Location' : selectedMarker === 'ambulance' ? 'Ambulance Location' : 'Driver Location'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {selectedMarker === 'user' 
                    ? bookingData.address 
                    : selectedMarker === 'ambulance'
                      ? ambulanceDetails?.ambulance_address
                      : `Driver is on the way!`
                  }
                </div>
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      </div>
    );
  };

  useEffect(() => {
    let pollingInterval;
    
    const pollBookingStatus = async (bookingId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/emergency-booking/status/${bookingId}`);
        const data = await response.json();
        
        if (data.success) {
          setBookingStatus(data.data.status);
          
          // Update driver location if booking is accepted
          if (data.data.status === 'ACCEPTED' && data.data.ambulanceDetails?.coordinates) {
            setDriverLocation({
              lat: data.data.ambulanceDetails.coordinates.latitude,
              lng: data.data.ambulanceDetails.coordinates.longitude
            });
          }
          
          // If rejected, show new ambulance being assigned
          if (data.data.status === 'REJECTED') {
            setBookingError('Previous driver rejected. Finding new ambulance...');
            // The backend will automatically find a new ambulance
          }
          
          // Stop polling if we reach a final state
          if (['COMPLETED', 'CANCELLED'].includes(data.data.status)) {
            clearInterval(pollingInterval);
          }
        }
      } catch (error) {
        console.error('Error polling booking status:', error);
      }
    };

    if (bookingId) {
      pollingInterval = setInterval(() => pollBookingStatus(bookingId), 5000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [bookingId]);

  const emergencyTypes = [
    { id: 'cardiac', label: 'Cardiac Arrest', icon: '🫀' },
    { id: 'stroke', label: 'Stroke', icon: '🧠' },
    { id: 'accident', label: 'Accident', icon: '🚗' },
    { id: 'breathing', label: 'Breathing Problem', icon: '🫁' },
    { id: 'other', label: 'Other Emergency', icon: '🏥' },
  ]

  const handleEmergencyTypeSelect = (type) => {
    setBookingData({ ...bookingData, emergencyType: type })
    setStep(2)
  }

  const handleLocationError = (error) => {
    let errorMessage = 'Error getting your location. ';
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Please enable location services in your browser.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage += 'Location request timed out.';
        break;
      default:
        errorMessage += 'An unknown error occurred.';
    }
    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setLoading(true);
    setBookingError(null);
    setError('');

    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get address from coordinates
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };
            
            geocoder.geocode({ location: latlng }, async (results, status) => {
              if (status === 'OK') {
                try {
                  const address = results[0].formatted_address;
                  
                  // Get predicted ambulance
                  const predictionResponse = await getPredictedAmbulance({
                    latitude,
                    longitude
                  });

                  if (!predictionResponse || !predictionResponse.ambulance_number) {
                    throw new Error('Failed to get ambulance prediction');
                  }

                  // Parse ambulance coordinates
                  const coordsMatch = predictionResponse.ambulance_coordinates.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
                  if (coordsMatch) {
                    const [_, ambLat, ambLng] = coordsMatch;
                    const ambLocation = {
                      lat: parseFloat(ambLat),
                      lng: parseFloat(ambLng)
                    };
                    setAmbulanceLocation(ambLocation);
                  }

                  // Set route details from ML prediction
                  if (predictionResponse.optimal_route) {
                    setRouteDetails({
                      name: predictionResponse.optimal_route.name,
                      distance: predictionResponse.optimal_route.distance,
                      duration_in_traffic: predictionResponse.optimal_route.duration_in_traffic,
                      traffic_percentage: predictionResponse.optimal_route.traffic_percentage,
                      route_description: predictionResponse.optimal_route.route_description
                    });
                    
                    if (predictionResponse.optimal_route.alternative_routes) {
                      setAlternativeRoutes(predictionResponse.optimal_route.alternative_routes);
                    }
                  }

                  // Create booking
                  const bookingResponse = await createEmergencyBooking({
                    emergencyType: bookingData.emergencyType,
                    latitude,
                    longitude,
                    address,
                    ambulanceNumber: predictionResponse.ambulance_number,
                    ambulanceDetails: {
                      vehicleNumber: predictionResponse.ambulance_number,
                      phoneNumber: predictionResponse.phone_number,
                      address: predictionResponse.ambulance_address,
                      coordinates: predictionResponse.ambulance_coordinates
                    }
                  });

                  if (bookingResponse.success) {
                    setSuccess(true);
                    setBookingId(bookingResponse.data.bookingId);
                    setBookingStatus(bookingResponse.data.status);
                    setStep(3);

                    setAmbulanceDetails({
                      vehicleNumber: bookingResponse.data.ambulanceDetails.vehicleNumber,
                      contactNumber: bookingResponse.data.ambulanceDetails.phoneNumber,
                      address: bookingResponse.data.ambulanceDetails.address
                    });

                    if (userLocation && ambulanceLocation) {
                      calculateRouteDistance();
                    }

                    if (!bookingResponse.notificationSent) {
                      console.warn('Notification could not be sent to driver, but booking was created');
                    }

                    setLoading(false);
                  } else {
                    throw new Error(bookingResponse.message || 'Failed to create booking');
                  }
                } catch (err) {
                  throw new Error(err.message || 'Failed to process booking');
                }
              } else {
                throw new Error('Failed to get address from coordinates');
              }
            });
          } catch (error) {
            throw error;
          }
        }, (error) => {
          handleLocationError(error);
        });
      } else {
        throw new Error('Geolocation is not supported by your browser');
      }
    } catch (error) {
      setError(error.message);
      setBookingError(error.message);
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.emergencyType) {
      toast.error('Please select an emergency type', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!bookingData.latitude || !bookingData.longitude) {
      toast.error('Please enable location services or select a location on the map', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await createEmergencyBooking(bookingData);
      
      if (response.success) {
        setBookingId(response.bookingId);
        toast.success('Emergency booking created successfully! Searching for nearby ambulances...', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setStep(2);
      } else {
        toast.error(response.message || 'Failed to create booking', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      // Add your cancel booking API call here
      toast.info('Cancelling your booking...', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset states
      setStep(1);
      setBookingId(null);
      setDirections(null);
      setAmbulanceDetails(null);
      setBookingData({
        emergencyType: '',
        latitude: null,
        longitude: null,
        address: ''
      });
      
      toast.success('Booking cancelled successfully', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Failed to cancel booking', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const getLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setBookingData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }))

        setUserLocation({ lat, lng })

        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              setBookingData(prev => ({ ...prev, address: results[0].formatted_address }))
              await handleSubmit();
            } else {
              setError('No address found for this location.')
              setLoading(false)
            }
          } else {
            setError('Failed to get address from location.')
            setLoading(false)
          }
        })
      },
      (error) => {
        handleLocationError(error);
      }
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Emergency Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {emergencyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleEmergencyTypeSelect(type.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
              >
                <span className="text-3xl mb-2">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Get Your Location</h2>
          <button
            onClick={getLocation}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Getting Location...' : 'Get My Location'}
          </button>
        </div>
      )}

      {step === 3 && success && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">The Allocated Ambulance is:</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">Ambulance Number:</span>
                <span className="text-lg">{ambulanceDetails?.vehicleNumber}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">Phone Number:</span>
                <span className="text-lg">{ambulanceDetails?.contactNumber}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">Ambulance Address:</span>
                <span className="text-lg">{ambulanceDetails?.address}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">Ambulance Coordinates:</span>
                <span className="text-lg">({ambulanceLocation?.lat.toFixed(4)}, {ambulanceLocation?.lng.toFixed(4)})</span>
              </div>
            </div>
          </div>

          {routeDetails && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-green-600">The Optimized Route is:</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Route:</span>
                  <span className="text-lg">{routeDetails.name}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Distance:</span>
                  <span className="text-lg">{parseFloat(routeDetails.distance).toFixed(1)} km</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Duration in Traffic:</span>
                  <span className="text-lg">{parseInt(routeDetails.duration_in_traffic)} min</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Traffic Percentage:</span>
                  <span className="text-lg">{parseFloat(routeDetails.traffic_percentage).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {bookingStatus === 'PENDING' && (
            <div className="bg-yellow-100 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-yellow-600">Booking Status:</h2>
              <p className="text-lg">Your booking is pending. Please wait for the driver to accept.</p>
            </div>
          )}

          {bookingStatus === 'ACCEPTED' && (
            <div className="bg-green-100 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-green-600">Booking Status:</h2>
              <p className="text-lg">Your booking has been accepted. The driver is on the way!</p>
            </div>
          )}

          {bookingStatus === 'REJECTED' && (
            <div className="bg-red-100 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-red-600">Booking Status:</h2>
              <p className="text-lg">Your booking has been rejected. We are finding a new ambulance for you.</p>
            </div>
          )}

          {bookingStatus === 'COMPLETED' && (
            <div className="bg-blue-100 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-blue-600">Booking Status:</h2>
              <p className="text-lg">Your booking has been completed. Thank you for using our service!</p>
            </div>
          )}

          {bookingStatus === 'CANCELLED' && (
            <div className="bg-red-100 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-red-600">Booking Status:</h2>
              <p className="text-lg">Your booking has been cancelled.</p>
            </div>
          )}

          {!showMap && showTrackButton && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleTrackAmbulance}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold shadow-md"
              >
                Track Ambulance
              </button>
            </div>
          )}

          {showMap && (
            <div className="relative">
              <div style={isWideMap ? wideMapStyle : normalMapStyle}>
                <div style={mapControlsStyle}>
                  {isWideMap ? (
                    <button
                      onClick={handleMapShrink}
                      className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Shrink Map</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleMapExpand}
                      className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span>Expand Map</span>
                    </button>
                  )}
                  <button
                    onClick={handleCloseMap}
                    className="bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Close Map</span>
                  </button>
                </div>
                
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={isWideMap ? wideMapStyle : normalMapStyle}
                    center={center}
                    zoom={13}
                    onLoad={(map) => {
                      mapRef.current = map;
                      if (onMapLoad) onMapLoad(map);
                    }}
                    options={{
                      zoomControl: true,
                      streetViewControl: true,
                      mapTypeControl: true,
                      fullscreenControl: false
                    }}
                  >
                    {userLocation && (
                      <>
                        <MarkerF
                          position={userLocation}
                          icon={{
                            url: '/user-location.png',
                            scaledSize: new window.google.maps.Size(40, 40)
                          }}
                          onClick={() => handleMarkerClick('user')}
                        />
                        {selectedMarker === 'user' && (
                          <InfoWindowF
                            position={userLocation}
                            onCloseClick={handleInfoWindowClose}
                          >
                            <div className="p-2">
                              <h3 className="font-semibold text-lg mb-1">Your Location</h3>
                              <p className="text-gray-600">Coordinates: ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</p>
                            </div>
                          </InfoWindowF>
                        )}
                      </>
                    )}
                    
                    {ambulanceLocation && (
                      <>
                        <MarkerF
                          position={ambulanceLocation}
                          icon={{
                            url: '/ambulance-icon.png',
                            scaledSize: new window.google.maps.Size(40, 40)
                          }}
                          onClick={() => handleMarkerClick('ambulance')}
                        />
                        {selectedMarker === 'ambulance' && (
                          <InfoWindowF
                            position={ambulanceLocation}
                            onCloseClick={handleInfoWindowClose}
                          >
                            <div className="p-2">
                              <h3 className="font-semibold text-lg mb-1">Ambulance Details</h3>
                              <p className="text-gray-600 mb-1">Vehicle: {ambulanceDetails?.vehicleNumber}</p>
                              <p className="text-gray-600 mb-1">Phone: {ambulanceDetails?.contactNumber}</p>
                              <p className="text-gray-600">Address: {ambulanceDetails?.address}</p>
                            </div>
                          </InfoWindowF>
                        )}
                      </>
                    )}
                    
                    {driverLocation && (
                      <>
                        <MarkerF
                          position={driverLocation}
                          icon={{
                            url: '/driver-icon.png',
                            scaledSize: new window.google.maps.Size(40, 40)
                          }}
                          onClick={() => handleMarkerClick('driver')}
                        />
                        {selectedMarker === 'driver' && (
                          <InfoWindowF
                            position={driverLocation}
                            onCloseClick={handleInfoWindowClose}
                          >
                            <div className="p-2">
                              <h3 className="font-semibold text-lg mb-1">Driver Location</h3>
                              <p className="text-gray-600">The driver is on the way!</p>
                            </div>
                          </InfoWindowF>
                        )}
                      </>
                    )}
                    
                    {directions && <DirectionsRenderer directions={directions} />}
                  </GoogleMap>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
