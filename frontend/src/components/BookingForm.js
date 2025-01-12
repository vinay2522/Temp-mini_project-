import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { 
  GoogleMap, 
  useJsApiLoader, 
  DirectionsRenderer, 
  MarkerF,
  OverlayView 
} from '@react-google-maps/api'
import { createEmergencyBooking, getEmergencyBookingStatus, getPredictedAmbulance } from '../api/api'

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  transition: 'all 0.3s ease-in-out'
}

const wideMapStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  backgroundColor: 'white'
};

const normalMapStyle = {
  width: '100%',
  height: '60vh',
  position: 'relative'
};

const libraries = ['places', 'geometry', 'marker']

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
}

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
    setShowMap(true);
    setShowTrackButton(false);
    // Calculate route immediately when showing map
    if (userLocation && ambulanceLocation) {
      calculateRouteDistance();
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setShowTrackButton(true);
    setIsWideMap(false);
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
        <div className="absolute top-4 right-4 z-[10000] flex gap-2">
          <button
            onClick={() => setIsWideMap(!isWideMap)}
            className="px-4 py-2 bg-white rounded-md shadow-lg hover:bg-gray-100 transition-colors"
          >
            {isWideMap ? 'Shrink Map' : 'Expand Map'}
          </button>
          <button
            onClick={handleCloseMap}
            className="px-4 py-2 bg-white rounded-md shadow-lg hover:bg-gray-100 transition-colors"
          >
            Close Map
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
              onClick={() => setSelectedMarker('ambulance')}
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
                  : ambulanceLocation
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
                  {selectedMarker === 'user' ? 'Your Location' : 'Ambulance Location'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {selectedMarker === 'user' 
                    ? bookingData.address 
                    : ambulanceDetails?.ambulance_address
                  }
                </div>
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      </div>
    );
  };

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
              await handleBooking(lat, lng, results[0].formatted_address)
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
        setError('Failed to get your location. Please try again.')
        setLoading(false)
      }
    )
  }

  const handleBooking = async (lat, lon, address) => {
    try {
      const bookingPayload = {
        emergencyType: bookingData.emergencyType,
        latitude: lat,
        longitude: lon,
        address: address
      }

      const predictionResponse = await getPredictedAmbulance({
        latitude: lat,
        longitude: lon
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

      const response = await createEmergencyBooking({
        ...bookingPayload,
        ambulanceNumber: predictionResponse.ambulance_number,
        ambulanceDetails: {
          vehicleNumber: predictionResponse.ambulance_number,
          phoneNumber: predictionResponse.phone_number,
          address: predictionResponse.ambulance_address,
          coordinates: predictionResponse.ambulance_coordinates
        }
      });

      if (response && response.booking_id) {
        setSuccess(true);
        setLoading(false);
        setStep(3);
        setBookingId(response.booking_id);

        setAmbulanceDetails({
          vehicleNumber: predictionResponse.ambulance_number,
          contactNumber: predictionResponse.phone_number,
          address: predictionResponse.ambulance_address
        });

        if (userLocation && ambulanceLocation) {
          calculateRouteDistance();
        }
      } else {
        throw new Error('Booking failed: Invalid response from server');
      }
    } catch (err) {
      console.error('Booking Error:', err);
      setError('Failed to book ambulance. Please try again.');
      setLoading(false);
    }
  };

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">The Allocated Ambulance is:</h2>
          {ambulanceDetails && (
            <div className="mb-4">
              <div className="space-y-2 border-b pb-4">
                <p><strong>Ambulance Number:</strong> {ambulanceDetails.vehicleNumber}</p>
                <p><strong>Phone Number:</strong> {ambulanceDetails.contactNumber}</p>
                <p><strong>Current Location:</strong> {ambulanceDetails.address}</p>
              </div>
              
              {routeDetails && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">Route Details:</h3>
                    <div className="ml-4 space-y-2">
                      <p><strong>Distance:</strong> {routeDetails.distance}</p>
                      <p><strong>Normal Duration:</strong> {routeDetails.current_duration}</p>
                      <p><strong>Duration in Traffic:</strong> {routeDetails.duration_in_traffic}</p>
                      <p><strong>Traffic Condition:</strong> {routeDetails.traffic_percentage}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">Recommended Route:</h3>
                    <div className="ml-4 bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{routeDetails.route_description}</p>
                    </div>
                  </div>

                  {alternativeRoutes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-orange-600 mb-2">Alternative Routes:</h3>
                      <div className="ml-4 space-y-2">
                        {alternativeRoutes.map((route, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p><strong>{route.name}:</strong></p>
                            <p className="ml-4">Traffic: {route.traffic_percentage}</p>
                            <p className="ml-4">Duration: {route.duration_in_traffic}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {showTrackButton && (
            <button
              onClick={handleTrackAmbulance}
              className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
            >
              Track Ambulance
            </button>
          )}
        </div>
      )}

      {showMap && renderMap()}
    </div>
  );
}
