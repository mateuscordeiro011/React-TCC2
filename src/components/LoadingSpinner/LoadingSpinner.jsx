import React from 'react';
import './LoadingSpinner.css'; 

const LoadingSpinner = ({ size = 'md', message = null, fullscreen = false }) => {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  const containerClasses = `spinner-container ${fullscreen ? 'spinner-fullscreen' : ''}`;
  const spinnerClasses = `spinner ${sizeClasses[size]}`;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={spinnerClasses}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;