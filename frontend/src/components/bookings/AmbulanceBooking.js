import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaAmbulance, FaMapMarkerAlt, FaUser, FaPhone, FaNotesMedical } from 'react-icons/fa';

const AmbulanceBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    patientName: '',
    contactNumber: '',
    emergencyType: 'MEDICAL',
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/bookings/ambulance`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Ambulance booked successfully!');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.error || 'Failed to book ambulance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaAmbulance className="w-16 h-16 text-seva-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book an Ambulance</h1>
          <p className="text-xl text-gray-600">Emergency medical transportation service</p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-2" />
                Pickup Location
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Enter pickup address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-2" />
                Drop Location
              </label>
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Enter hospital/destination address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaUser className="inline mr-2" />
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaPhone className="inline mr-2" />
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaNotesMedical className="inline mr-2" />
                Emergency Type
              </label>
              <select
                name="emergencyType"
                value={formData.emergencyType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
              >
                <option value="MEDICAL">Medical Emergency</option>
                <option value="ACCIDENT">Accident</option>
                <option value="CARDIAC">Cardiac Emergency</option>
                <option value="PREGNANCY">Pregnancy Related</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Any additional information..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-seva-red text-white rounded-md hover:bg-seva-red/90 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Ambulance'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceBooking;
