import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = ({ phoneNumber }) => {
  const handleWhatsAppClick = () => {
    // Format the phone number (remove any non-numeric characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
      aria-label="Contact on WhatsApp"
    >
      <FaWhatsapp className="text-2xl" />
    </button>
  );
};

export default WhatsAppButton;
