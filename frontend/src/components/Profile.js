import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import LoadingSpinner from './ui/LoadingSpinner';
import defaultAvatar from '../assets/default-avatar.svg';

const Profile = () => {
  const { user, loading: authLoading, error: authError, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.mobileNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      toast.error(authError);
    }
  }, [authError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to update your profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await updateProfile({
        name: formData.name.trim(),
        mobileNumber: formData.phone.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim()
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Update form data with new user data to ensure consistency
        setFormData({
          name: response.user.name || '',
          phone: response.user.mobileNumber || '',
          address: response.user.address || '',
          bio: response.user.bio || ''
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await uploadAvatar(formData);
      if (response.success) {
        toast.success('Profile picture updated successfully');
      } else {
        throw new Error(response.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload profile picture');
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${process.env.REACT_APP_API_BASE_URL}${avatarPath}`;
  };

  if (authLoading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 mb-6 sm:mb-0">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 sm:right-1/3 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <FaCamera className="w-5 h-5" />
                </label>
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-semibold text-gray-900">{user.name || 'No Name'}</h2>
                <p className="text-sm text-gray-500">{user.accountType || (user.isDriver ? 'Driver' : 'User')}</p>
              </div>
            </div>

            <div className="sm:w-2/3 sm:pl-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <FaSave className="mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    <dl className="mt-2 space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.mobileNumber || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Bio</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.bio || 'No bio provided'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                    <dl className="mt-2 space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;