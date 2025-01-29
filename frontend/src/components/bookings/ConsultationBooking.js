import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaUserMd, FaUser, FaPhone, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    contactNumber: '',
    consultationType: 'GENERAL',
    preferredDate: '',
    symptoms: '',
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
    
    // Validate form data
    if (!formData.patientName.trim() || !formData.contactNumber.trim() || 
        !formData.preferredDate || !formData.symptoms.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    if (selectedDate < today) {
      toast.error('Please select a future date for consultation');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/bookings/consultation`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Consultation booked successfully!');
        navigate('/bookings');
      } else {
        throw new Error(response.data.message || 'Failed to book consultation');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to book consultation');
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
        <div className="text-center mb-12">
          <FaUserMd className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Medical Consultation</h1>
          <p className="text-xl text-gray-600">Schedule a consultation with our medical experts</p>
        </div>

        {/* Booking Form */}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaUserMd className="inline mr-2" />
                Consultation Type
              </label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="GENERAL">General Consultation</option>
                <option value="EMERGENCY">Emergency Consultation</option>
                <option value="FOLLOWUP">Follow-up Consultation</option>
                <option value="SPECIALIST">Specialist Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-2" />
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                required
                min={getMinDate()}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaNotesMedical className="inline mr-2" />
                Symptoms/Reason for Consultation
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe your symptoms or reason for consultation..."
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </span>
                ) : (
                  'Book Consultation'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;
