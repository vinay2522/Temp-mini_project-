import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaHospital, FaBlog, FaImages, FaDownload, FaQuestionCircle, FaUser, FaCog, FaSignOutAlt, FaAmbulance } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Home', path: '/', icon: FaHome },
    { title: 'Services', path: '/services', icon: MdMedicalServices },
    { title: 'Hospitals', path: '/hospitals', icon: FaHospital },
    { title: 'Blog', path: '/blog', icon: FaBlog },
    { title: 'Gallery', path: '/gallery', icon: FaImages },
    { title: 'Download', path: '/download', icon: FaDownload },
    { title: 'Help Desk', path: '/helpdesk', icon: FaQuestionCircle },
    ...(user ? [{ title: 'Book Ambulance', path: '/book-ambulance', icon: FaAmbulance }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login'; // Force a full page refresh on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      animate={{
        width: isOpen ? "16rem" : "4rem",
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        damping: 10,
      }}
      className="fixed left-0 top-0 h-screen bg-white shadow-lg z-50 border-r border-gray-200"
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar || '/ui/default-avatar.png'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/ui/default-avatar.png';
                  }}
                />
                {isOpen && (
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {user.name || 'User'}
                    </span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <img
                src="/images/seva-logo.webp"
                alt="SevaDrive Logo"
                className="w-19 h-19 rounded-full"
              />
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-3 text-gray-700 
                hover:bg-gray-100 transition-colors duration-200
                ${location.pathname === item.path ? 'bg-blue-100 text-blue-600' : ''}
                ${!isOpen && 'justify-center'}`}
            >
              <item.icon className={`${!isOpen ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
              {isOpen && (
                <Link to={item.path}>
                  {item.title}
                </Link>
              )}
            </motion.div>
          ))}

          {user && isOpen && (
            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <FaUser className="w-5 h-5 mr-3" />
                <Link to="/profile">Profile</Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-3 text-red-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </motion.div>
            </div>
          )}

          {!user && isOpen && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-3 text-blue-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <FaUser className="w-5 h-5 mr-3" />
              <Link to="/login">Login</Link>
            </motion.div>
          )}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
