import React from 'react';

const ThresholdAlert = ({ thresholdsCrossed }) => {
  if (!thresholdsCrossed || thresholdsCrossed.length === 0) return null;

  return (
    <div className="alert-banner">
       THRESHOLD CROSSED: {thresholdsCrossed.map(t => t.message).join(', ')}
    </div>
  );
};

export default ThresholdAlert;