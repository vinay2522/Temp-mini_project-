import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ className = '', fullScreen = false, small = false }) => {
  const spinnerContent = (
    <div className={`spinner ${small ? 'spinner-sm' : ''} ${className}`} role="status">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-core"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      {!small && <div className="loading-text">Loading...</div>}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-container">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
