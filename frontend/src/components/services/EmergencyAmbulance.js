import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { createEmergencyBooking, pollBookingStatus } from '../../api';
import LoadingSpinner from '../LoadingSpinner';

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const EmergencyAmbulance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [emergencyType, setEmergencyType] = useState('cardiac');
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    // Reverse geocode to get address
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
                        .then(res => res.json())
                        .then(data => setAddress(data.display_name))
                        .catch(err => console.error('Error getting address:', err));
                },
                error => {
                    console.error('Error getting location:', error);
                    setError('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    }, []);

    // Handle status updates
    const handleStatusUpdate = (status, data) => {
        setBookingStatus(status);
        switch (status) {
            case 'PENDING':
                setStatusMessage('Waiting for driver response...');
                break;
            case 'ACCEPTED':
                setStatusMessage('Driver has accepted! Help is on the way.');
                // You can add additional driver info here
                break;
            case 'REJECTED':
                setStatusMessage('Driver unavailable. Finding another ambulance...');
                break;
            case 'CANCELLED':
                setStatusMessage('Booking was cancelled.');
                break;
            default:
                setStatusMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulated ambulance data (replace with actual data from your backend)
            const ambulanceData = {
                vehicleNumber: 'KA01AE8844',
                phoneNumber: '9632598430',
                address: '84J3+25C, Kodlapura, Shanti Nagar, Tumakuru, Karnataka 572102, India',
                coordinates: '(13.32991, 77.10272)'
            };
            setSelectedAmbulance(ambulanceData);

            const bookingData = {
                emergencyType,
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
                address,
                ambulanceNumber: ambulanceData.vehicleNumber,
                ambulanceDetails: ambulanceData
            };

            const response = await createEmergencyBooking(bookingData);
            setBookingStatus('PENDING');
            setStatusMessage('Booking created! Waiting for driver response...');

            // Start polling for status updates
            pollBookingStatus(response.data.data.bookingId, handleStatusUpdate);

        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.message || 'Error creating booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Emergency Ambulance Service</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Emergency Type</label>
                        <select
                            value={emergencyType}
                            onChange={(e) => setEmergencyType(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="cardiac">Cardiac Emergency</option>
                            <option value="accident">Accident</option>
                            <option value="breathing">Breathing Difficulty</option>
                            <option value="pregnancy">Pregnancy</option>
                            <option value="other">Other Emergency</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Your Location</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Loading your location..."
                            disabled
                        />
                    </div>

                    {currentLocation && (
                        <div className="h-64 rounded-lg overflow-hidden">
                            <MapContainer
                                center={[currentLocation.lat, currentLocation.lng]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[currentLocation.lat, currentLocation.lng]}>
                                    <Popup>Your Location</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}

                    {/* Booking Status Section */}
                    {bookingStatus && (
                        <div className={`p-4 rounded-lg ${
                            bookingStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            bookingStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            <h3 className="font-bold mb-2">Booking Status: {bookingStatus}</h3>
                            <p>{statusMessage}</p>
                            
                            {selectedAmbulance && bookingStatus === 'ACCEPTED' && (
                                <div className="mt-4">
                                    <h4 className="font-semibold">Ambulance Details:</h4>
                                    <p>Vehicle: {selectedAmbulance.vehicleNumber}</p>
                                    <p>Location: {selectedAmbulance.address}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !currentLocation || bookingStatus}
                        className={`w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200 ${
                            (loading || !currentLocation || bookingStatus) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? <LoadingSpinner /> : 'Request Emergency Ambulance'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EmergencyAmbulance;
