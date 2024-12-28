import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAmbulance, FaClock, FaUserMd, FaMapMarkedAlt } from 'react-icons/fa';

const EmergencyAmbulance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaAmbulance className="w-16 h-16 text-seva-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emergency Ambulance Service</h1>
          <p className="text-xl text-gray-600">Immediate medical response with fully equipped ambulances and trained paramedics</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaClock className="w-8 h-8 text-seva-red mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
            <p className="text-gray-600">Round-the-clock emergency response team ready to assist you anytime</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaUserMd className="w-8 h-8 text-seva-red mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Medical Team</h3>
            <p className="text-gray-600">Highly trained paramedics and medical professionals</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaMapMarkedAlt className="w-8 h-8 text-seva-red mb-4" />
            <h3 className="text-xl font-semibold mb-2">GPS Tracking</h3>
            <p className="text-gray-600">Real-time location tracking for quick and efficient response</p>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Advanced Medical Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Basic Life Support</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Oxygen delivery systems</li>
                <li>Automated External Defibrillator (AED)</li>
                <li>First aid and trauma kits</li>
                <li>Patient monitoring equipment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Advanced Life Support</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Cardiac monitoring equipment</li>
                <li>Advanced airway management tools</li>
                <li>Emergency medications</li>
                <li>Critical care supplies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-seva-red rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Emergency Assistance?</h2>
          <p className="text-xl mb-8">Our emergency response team is ready to help</p>
          <button
            onClick={() => navigate('/book-ambulance')}
            className="bg-white text-seva-red px-8 py-3 rounded-lg font-semibold text-xl hover:bg-gray-100 transition-colors"
          >
            Book Ambulance Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAmbulance;
