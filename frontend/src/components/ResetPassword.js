import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || '');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/reset-password', { email, resetToken, newPassword });
      setMessage(response.data.message);
      setError(null);
      // Redirect to login page after successful password reset
      navigate('/login');
    } catch (error) {
      setError(error.response.data.message);
      setMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        </div>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        {message && <p className="mt-2 text-center text-sm text-green-600">{message}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="reset-token" className="sr-only">Reset Token</label>
              <input
                id="reset-token"
                name="resetToken"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Reset Token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;