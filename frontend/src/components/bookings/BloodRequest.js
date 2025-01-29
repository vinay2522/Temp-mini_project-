import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaHeart, FaUser, FaPhone, FaHospital, FaExclamationTriangle } from 'react-icons/fa';

const BloodRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    units: 1,
    hospital: '',
    urgency: 'NORMAL',
    contactNumber: '',
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
        `${process.env.REACT_APP_API_BASE_URL}/api/bookings/blood-request`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Blood request submitted successfully!');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('Request error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaHeart className="w-16 h-16 text-seva-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Request</h1>
          <p className="text-xl text-gray-600">Request blood for emergency needs</p>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Units Required
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaHospital className="inline mr-2" />
                Hospital Name
              </label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                placeholder="Enter hospital name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaExclamationTriangle className="inline mr-2" />
                Urgency Level
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
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
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BloodRequest;
