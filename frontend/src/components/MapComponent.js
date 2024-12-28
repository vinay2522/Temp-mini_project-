import React, { useEffect, useRef, useState } from 'react';
import useLoadScript from './useLoadScript';

const MapComponent = ({ userLocation, ambulanceLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [travelInfo, setTravelInfo] = useState({ distance: '', duration: '' });

  // Dynamically load the Google Maps script
  useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
  );

  useEffect(() => {
    if (!userLocation || !ambulanceLocation || !mapRef.current) return;

    const initializeMap = () => {
      if (!window.google) return; // Ensure the API is loaded

      const google = window.google;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsRenderer(directionsDisplay);

      calculateRoute(directionsService, directionsDisplay);
    };

    initializeMap();
  }, [userLocation, ambulanceLocation]);

  const calculateRoute = async (directionsService, directionsDisplay) => {
    try {
      if (!window.google) return;

      const google = window.google;

      const response = await directionsService.route({
        origin: ambulanceLocation,
        destination: userLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      directionsDisplay.setDirections(response);

      const distanceMatrixService = new google.maps.DistanceMatrixService();
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [ambulanceLocation],
          destinations: [userLocation],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            const element = result.rows[0].elements[0];
            setTravelInfo({
              distance: element.distance.text,
              duration: element.duration.text,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  useEffect(() => {
    if (map && ambulanceLocation) {
      map.panTo(ambulanceLocation);
      calculateRoute(
        new window.google.maps.DirectionsService(),
        directionsRenderer
      );
    }
  }, [ambulanceLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white p-4 shadow-lg rounded-md">
        <h4 className="text-lg font-bold">Ambulance Tracking</h4>
        <p>Distance: {travelInfo.distance}</p>
        <p>ETA: {travelInfo.duration}</p>
      </div>
    </div>
  );
};

export default MapComponent;