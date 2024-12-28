import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHome, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-seva-dark text-seva-light py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SevaDrive Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold mb-4">SevaDrive</h3>
            <p className="mb-4">
              SevaDrive is a platform dedicated to providing emergency ambulance services. Our mission is to ensure that everyone has access to timely and reliable medical transportation in times of need.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="https://www.facebook.com" className="text-seva-light hover:text-seva-red transition-colors duration-300"><FaFacebookF /></a>
              <a href="https://www.twitter.com" className="text-seva-light hover:text-seva-red transition-colors duration-300"><FaTwitter /></a>
              <a href="https://www.instagram.com" className="text-seva-light hover:text-seva-red transition-colors duration-300"><FaInstagram /></a>
              <a href="https://www.linkedin.com" className="text-seva-light hover:text-seva-red transition-colors duration-300"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="flex items-center justify-center sm:justify-start space-x-2 hover:text-seva-red transition-colors duration-300"><FaHome /><span>About Us</span></a></li>
              <li><a href="/services" className="flex items-center justify-center sm:justify-start space-x-2 hover:text-seva-red transition-colors duration-300"><FaHome /><span>Services</span></a></li>
              <li><a href="/contact" className="flex items-center justify-center sm:justify-start space-x-2 hover:text-seva-red transition-colors duration-300"><FaHome /><span>Contact Us</span></a></li>
              <li><a href="/privacy" className="flex items-center justify-center sm:justify-start space-x-2 hover:text-seva-red transition-colors duration-300"><FaHome /><span>Privacy Policy</span></a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="mb-2 flex items-center justify-center sm:justify-start"><FaHome className="mr-2" />123 SevaDrive St, City, Country</p>
            <p className="mb-2 flex items-center justify-center sm:justify-start"><FaPhoneAlt className="mr-2" />Phone: +91 9632598430</p>
            <p className="flex items-center justify-center sm:justify-start"><FaEnvelope className="mr-2" />Email: ambulanceeus@gmail.com</p>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-8 pt-8 border-t border-seva-gray text-center">
          <p>&copy; 2023 SevaDrive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;