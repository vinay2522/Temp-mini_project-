import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  FaHeart,
  FaTint,
  FaUserMd,
  FaHospital,
  FaClipboardList,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';

const BloodServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [compatibility, setCompatibility] = useState([]);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBloodServiceData();
  }, []);

  const fetchBloodServiceData = async () => {
    try {
      const [inventoryRes, compatibilityRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/blood-services/inventory`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/blood-services/compatibility`)
      ]);

      if (inventoryRes.data.success) {
        setInventory(inventoryRes.data.inventory);
      }

      if (compatibilityRes.data.success) {
        setCompatibility(compatibilityRes.data.compatibility);
      }
    } catch (error) {
      console.error('Error fetching blood service data:', error);
      toast.error('Failed to load blood service information');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityInfo = (bloodType) => {
    const info = compatibility.find(c => c.bloodType === bloodType);
    return info || { canDonateTo: [], canReceiveFrom: [] };
  };

  const handleBloodTypeSelect = (bloodType) => {
    setSelectedBloodType(bloodType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-seva-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blood services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FaHeart className="w-16 h-16 text-seva-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Services</h1>
          <p className="text-xl text-gray-600">Donate blood, save lives</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <FaTint className="w-8 h-8 text-seva-red mr-4" />
              <h2 className="text-2xl font-semibold">Donate Blood</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Your blood donation can save up to 3 lives. Register now to donate blood and make a difference.
            </p>
            <button
              onClick={() => navigate('/blood-services/donate')}
              className="w-full bg-seva-red text-white px-4 py-2 rounded-lg hover:bg-seva-red/90 transition-colors"
            >
              Register as Donor
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="w-8 h-8 text-yellow-500 mr-4" />
              <h2 className="text-2xl font-semibold">Emergency Request</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Need blood urgently? Submit an emergency blood request and we'll help you find donors.
            </p>
            <button
              onClick={() => navigate('/blood-request')}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Request Blood
            </button>
          </motion.div>
        </div>

        {/* Blood Inventory */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-12"
        >
          <div className="flex items-center mb-6">
            <FaHospital className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-2xl font-semibold">Current Blood Inventory</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <div
                key={item.bloodType}
                className={`p-4 rounded-lg ${
                  item.units < 5 ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <h3 className="text-xl font-bold">{item.bloodType}</h3>
                <p className={`${item.units < 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.units} units available
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Blood Compatibility Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-12"
        >
          <div className="flex items-center mb-6">
            <FaInfoCircle className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-2xl font-semibold">Blood Type Compatibility</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {compatibility.map((type) => (
              <button
                key={type.bloodType}
                onClick={() => handleBloodTypeSelect(type.bloodType)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedBloodType === type.bloodType
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                <h3 className="text-xl font-bold">{type.bloodType}</h3>
                <p className="text-gray-600">Click for info</p>
              </button>
            ))}
          </div>
          {selectedBloodType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">
                Compatibility for {selectedBloodType}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Can Donate To:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getCompatibilityInfo(selectedBloodType).canDonateTo.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Can Receive From:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getCompatibilityInfo(selectedBloodType).canReceiveFrom.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <FaUserMd className="w-8 h-8 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Eligibility</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Age: 18-65 years</li>
              <li>• Weight: 45+ kg</li>
              <li>• Good health condition</li>
              <li>• No recent infections</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <FaClipboardList className="w-8 h-8 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Process</h3>
            <ul className="text-gray-600 space-y-2">
              <li>1. Registration</li>
              <li>2. Basic health check</li>
              <li>3. Blood donation</li>
              <li>4. Post-donation care</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <FaTint className="w-8 h-8 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Benefits</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Free health screening</li>
              <li>• Helps burn calories</li>
              <li>• Reduces heart disease risk</li>
              <li>• Save up to 3 lives</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BloodServices;
