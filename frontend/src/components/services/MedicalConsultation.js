import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaVideo, FaPrescription, FaHistory } from 'react-icons/fa';

const MedicalConsultation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaUserMd className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Consultation</h1>
          <p className="text-xl text-gray-600">Connect with healthcare professionals during your medical transport</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaVideo className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Consultation</h3>
            <p className="text-gray-600">Real-time video consultations with medical experts</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaPrescription className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Digital Prescriptions</h3>
            <p className="text-gray-600">Receive and manage prescriptions digitally</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaHistory className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Medical History</h3>
            <p className="text-gray-600">Access to your medical records and history</p>
          </div>
        </div>

        {/* Consultation Types */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Consultations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Emergency Consultation</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Immediate medical advice
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Quick response time
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  24/7 availability
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Expert medical guidance
                </li>
              </ul>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Follow-up Consultation</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Scheduled appointments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Progress monitoring
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Treatment adjustments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Health recommendations
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Speak with a Doctor</h2>
          <p className="text-xl mb-8">Get professional medical advice during your transport</p>
          <button
            onClick={() => navigate('/book-consultation')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold text-xl hover:bg-gray-100 transition-colors"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalConsultation;
