import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWheelchair, FaAmbulance, FaUserNurse, FaCalendarAlt } from 'react-icons/fa';

const PatientTransport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaWheelchair className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Patient Transport Service</h1>
          <p className="text-xl text-gray-600">Professional medical transportation for non-emergency situations</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaCalendarAlt className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Scheduled Transport</h3>
            <p className="text-gray-600">Plan your medical transportation in advance for appointments and transfers</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaUserNurse className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Medical Assistance</h3>
            <p className="text-gray-600">Trained medical staff available during transport</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FaAmbulance className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Specialized Vehicles</h3>
            <p className="text-gray-600">Fully equipped vehicles for comfortable patient transport</p>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Transport Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Regular Transport</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Hospital appointments</li>
                <li>Clinic visits</li>
                <li>Rehabilitation sessions</li>
                <li>Regular checkups</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Special Care Transport</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Wheelchair assistance</li>
                <li>Stretcher transport</li>
                <li>Inter-facility transfers</li>
                <li>Post-surgery transport</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Transport?</h2>
          <p className="text-xl mb-8">Schedule your medical transport in advance</p>
          <button
            onClick={() => navigate('/book-transport')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-xl hover:bg-gray-100 transition-colors"
          >
            Schedule Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientTransport;
