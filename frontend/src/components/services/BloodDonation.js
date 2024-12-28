import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaHeart, FaUser, FaTint, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const BloodDonation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donorName: '',
    bloodType: '',
    age: '',
    weight: '',
    contactNumber: '',
    address: '',
    lastDonationDate: '',
    medicalConditions: [],
    medications: [],
    preferredDate: '',
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      toast.error('Age must be between 18 and 65 years');
      return;
    }

    if (parseInt(formData.weight) < 45) {
      toast.error('Weight must be at least 45 kg');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/blood-services/donate`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Blood donation registration successful!');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Failed to register for blood donation');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FaHeart className="w-16 h-16 text-seva-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Donation Registration</h1>
          <p className="text-xl text-gray-600">Thank you for choosing to donate blood</p>
        </motion.div>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-8"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <FaUser className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <FaTint className="inline mr-2" />
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                  >
                    <option value="">Select Type</option>
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
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="18"
                    max="65"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    min="45"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                  />
                </div>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <FaCalendarAlt className="inline mr-2" />
                  Last Donation Date (if any)
                </label>
                <input
                  type="date"
                  name="lastDonationDate"
                  value={formData.lastDonationDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.medicalConditions.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'medicalConditions')}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Medications (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.medications.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'medications')}
                  placeholder="e.g., Aspirin, Insulin"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
                />
              </div>
            </div>

            {/* Donation Schedule */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Donation Schedule</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Donation Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  min={getMinDate()}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-seva-red focus:border-seva-red"
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
                {loading ? 'Registering...' : 'Register as Donor'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default BloodDonation;
