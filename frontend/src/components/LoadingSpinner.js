import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen }) => {
  const spinnerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={spinnerClasses}>
      <motion.div
        className="w-12 h-12 border-4 border-blue-200 rounded-full"
        style={{ borderTopColor: '#3B82F6' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default LoadingSpinner;
