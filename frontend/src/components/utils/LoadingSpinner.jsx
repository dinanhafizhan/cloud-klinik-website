import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ text = "Memuat data..." }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-ring"></div>
      <div className="loading-text">{text}</div>
    </div>
  );
};

export default LoadingSpinner;
