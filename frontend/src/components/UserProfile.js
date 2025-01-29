import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaEdit, FaSave } from 'react-icons/fa';

const UserProfile = ({ user, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/users/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Profile updated successfully!');
      setEditing(false);
      if (onUpdateUser) {
        onUpdateUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }

    setLoading(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            {editing ? (
              <>
                <FaSave /> Save
              </>
            ) : (
              <>
                <FaEdit /> Edit
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Mobile Number</label>
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-2" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Emergency Contact</label>
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-2" />
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                rows="3"
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default UserProfile;
