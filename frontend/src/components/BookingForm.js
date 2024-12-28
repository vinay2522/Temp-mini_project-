"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '80vh'
}

const libraries = ['places']

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [tracking, setTracking] = useState(null)
  const [directions, setDirections] = useState(null)
  const [ambulanceDetails, setAmbulanceDetails] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const mapRef = useRef(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAL9FKmHqjFf8uH9svsTzD43QwZ00dvqNE',
    libraries,
  })

  const [bookingData, setBookingData] = useState({
    emergencyType: '',
    latitude: null,
    longitude: null,
    address: ''
  })

  const emergencyTypes = [
    { id: 'cardiac', label: 'Cardiac Arrest', icon: '🫀' },
    { id: 'stroke', label: 'Stroke', icon: '🧠' },
    { id: 'accident', label: 'Accident', icon: '🚗' },
    { id: 'breathing', label: 'Breathing Problem', icon: '🫁' },
    { id: 'other', label: 'Other Emergency', icon: '🏥' },
  ];


  const handleEmergencyTypeSelect = (type) => {
    setBookingData({ ...bookingData, emergencyType: type })
    setStep(2)
  }

  const getLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setBookingData(prev => ({ ...prev, latitude, longitude }))
          getAddressFromCoordinates(latitude, longitude)
        },
        (error) => {
          setError('Error getting location. Please try again.')
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
    }
  }

  const getAddressFromCoordinates = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          setBookingData(prev => ({ ...prev, address: results[0].formatted_address }))
          handleBooking(lat, lng, results[0].formatted_address)
        } else {
          setError('No address found for this location.')
          setLoading(false)
        }
      } else {
        setError('Geocoder failed due to: ' + status)
        setLoading(false)
      }
    })
  }

  const handleBooking = async (lat, lon, address) => {
    try {
      const bookingPayload = {
        ...bookingData,
        latitude: lat,
        longitude: lon,
        address: address
      }

      // In a real application, you would make an API call here
      // For demonstration, we'll simulate a successful booking
      await new Promise(resolve => setTimeout(resolve, 1000))

      const data = { bookingId: 'BOOKING-' + Math.floor(1000 + Math.random() * 9000) }
      setSuccess(true)
      setLoading(false)
      setStep(3)
      setBookingId(data.bookingId)

      setAmbulanceDetails({
        vehicleNumber: 'AMB-' + Math.floor(1000 + Math.random() * 9000),
        driverName: 'John Doe',
        contactNumber: '+1 (555) 123-4567'
      })
    } catch (err) {
      console.error('Booking Error:', err)
      setError('Failed to book ambulance. Please try again.')
      setLoading(false)
    }
  }

  const updateRoute = useCallback((origin, destination) => {
    if (isLoaded && window.google) {
      const directionsService = new window.google.maps.DirectionsService()
      const distanceMatrixService = new window.google.maps.DistanceMatrixService()

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result)
          } else {
            console.error(`error fetching directions ${result}`)
          }
        }
      )

      distanceMatrixService.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK') {
            const distance = response.rows[0].elements[0].distance.text
            const duration = response.rows[0].elements[0].duration.text
            setTracking(prev => ({
              ...prev,
              distance: distance,
              estimatedTime: duration
            }))
          }
        }
      )
    }
  }, [isLoaded])

  const trackAmbulance = useCallback(async () => {
    if (!bookingId) {
      console.error('No booking ID available for tracking')
      setError('Unable to track ambulance. Please try again.')
      return
    }

    try {
      // Simulating API call for ambulance tracking
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const simulatedAmbulanceLocation = {
        latitude: bookingData.latitude + (Math.random() - 0.5) * 0.01,
        longitude: bookingData.longitude + (Math.random() - 0.5) * 0.01
      }

      setTracking(prev => ({ 
        ...prev, 
        ambulanceLocation: simulatedAmbulanceLocation
      }))

      const origin = { lat: bookingData.latitude, lng: bookingData.longitude }
      const destination = { lat: simulatedAmbulanceLocation.latitude, lng: simulatedAmbulanceLocation.longitude }
      
      updateRoute(origin, destination)
    } catch (err) {
      console.error('Tracking Error:', err)
      setError('Failed to track ambulance. Please try again.')
    }
  }, [bookingId, bookingData.latitude, bookingData.longitude, updateRoute])

  const handleTrackAmbulance = () => {
    setShowMap(true)
    if (bookingId) {
      trackAmbulance()
    } else {
      setError('No active booking found. Please make a booking first.')
    }
  }

  useEffect(() => {
    let intervalId
    if (bookingId && showMap) {
      trackAmbulance()
      intervalId = setInterval(() => trackAmbulance(), 10000) // Update every 10 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [bookingId, showMap, trackAmbulance])

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const panTo = useCallback(({ lat, lng }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(14)
    }
  }, [])

  useEffect(() => {
    if (bookingData.latitude && bookingData.longitude) {
      panTo({ lat: bookingData.latitude, lng: bookingData.longitude })
    }
  }, [bookingData.latitude, bookingData.longitude, panTo])

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker)
  }

  if (loadError) {
    return <div>Error loading maps. Please check your internet connection and try again.</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white text-gray-800 rounded-lg p-6 max-w-md w-full mx-auto shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && 'Select Emergency Type'}
            {step === 2 && 'Location Access'}
            {step === 3 && 'Booking Confirmation'}
          </h2>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-3">
            {emergencyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleEmergencyTypeSelect(type.id)}
                className="flex items-center gap-3 w-full p-4 text-left rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-6 text-gray-600">
              We need your location to send the nearest available ambulance to you.
              Please enable location access when prompted.
            </p>
            <button
              onClick={getLocation}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Processing...' : 'Share Location & Book Now'}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}

        {step === 3 && success && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              An ambulance has been dispatched to your location.
              Please stay where you are.
            </p>
            <button
              onClick={handleTrackAmbulance}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Track Ambulance
            </button>
          </div>
        )}
      </div>

      {showMap && tracking && isLoaded && (
        <div className="w-full h-[80vh] bg-white rounded-lg shadow-md overflow-hidden relative">
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 bg-white text-gray-800 px-3 py-1 rounded-md shadow-md hover:bg-gray-100 transition duration-300 z-10"
          >
            Close Tracking
          </button>
          <div className="p-4 bg-gray-100">
            <h2 className="text-2xl font-bold mb-2">Ambulance Tracking</h2>
            <p className="mb-1">Distance: {tracking.distance}</p>
            <p className="mb-1">Estimated Arrival Time: {tracking.estimatedTime}</p>
            {ambulanceDetails && (
              <>
                <p className="mb-1">Vehicle Number: {ambulanceDetails.vehicleNumber}</p>
                <p className="mb-1">Driver: {ambulanceDetails.driverName}</p>
                <p>Contact: {ambulanceDetails.contactNumber}</p>
              </>
            )}
          </div>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: bookingData.latitude, lng: bookingData.longitude }}
            zoom={14}
            onLoad={onMapLoad}
          >
            {bookingData.latitude && bookingData.longitude && (
              <Marker
                position={{ lat: bookingData.latitude, lng: bookingData.longitude }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(20, 40),
                }}
                onClick={() => handleMarkerClick('user')}
              />
            )}
            {tracking && tracking.ambulanceLocation && (
              <Marker
                position={{ lat: tracking.ambulanceLocation.latitude, lng: tracking.ambulanceLocation.longitude }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(20, 40),
                }}
                onClick={() => handleMarkerClick('ambulance')}
              />
            )}
            {selectedMarker && (
              <InfoWindow
                position={
                  selectedMarker === 'user'
                    ? { lat: bookingData.latitude, lng: bookingData.longitude }
                    : { lat: tracking.ambulanceLocation.latitude, lng: tracking.ambulanceLocation.longitude }
                }
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedMarker === 'user' ? 'Your Location' : 'Ambulance Location'}</h3>
                  <p>{selectedMarker === 'user' ? bookingData.address : 'En route to your location'}</p>
                </div>
              </InfoWindow>
            )}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  },
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  )
}

