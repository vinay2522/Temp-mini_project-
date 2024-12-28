import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaPhone, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import useAuth from '../hooks/useAuth';

const Header = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center hover-scale">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-seva-red">SevaDrive</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="https://wa.me/9632598430" target="_blank" rel="noopener noreferrer" className="flex items-center text-seva-dark hover:text-seva-red transition-colors duration-300">
              <FaWhatsapp className="mr-2" />
              <span>WhatsApp</span>
            </a>
            <a href="tel:9632598430" className="flex items-center text-seva-dark hover:text-seva-red transition-colors duration-300">
              <FaPhone className="mr-2" />
              <span>Call</span>
            </a>
            {!loading && (
              user ? (
                <div className="flex items-center space-x-2">
                  <FaUser className="text-seva-dark" />
                  <span className="text-seva-dark">{user.email}</span>
                  <button onClick={handleLogout} className="bg-seva-red text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300">
                    <FaSignOutAlt className="mr-2 inline" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-seva-red text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors duration-300">
                  Login
                </Link>
              )
            )}
          </nav>
          <button className="md:hidden text-seva-dark" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <a href="https://wa.me/9632598430" target="_blank" rel="noopener noreferrer" className="block py-2 text-seva-dark hover:text-seva-red transition-colors duration-300">
              <FaWhatsapp className="inline-block mr-2" />
              WhatsApp
            </a>
            <a href="tel:9632598430" className="block py-2 text-seva-dark hover:text-seva-red transition-colors duration-300">
              <FaPhone className="inline-block mr-2" />
              Call
            </a>
            {!loading && (
              user ? (
                <div className="py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaUser className="text-seva-dark" />
                    <span className="text-seva-dark">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-seva-red text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 w-full">
                    <FaSignOutAlt className="mr-2 inline" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="block py-2 bg-seva-red text-white px-4 rounded-full hover:bg-red-600 transition-colors duration-300 text-center">
                  Login
                </Link>
              )
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
