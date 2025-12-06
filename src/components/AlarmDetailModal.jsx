import React from 'react';

const AlarmDetailModal = ({ alarm, isOpen, onClose }) => {
  if (!isOpen || !alarm) return null;

  // Get vehicle label
  const getVehicleLabel = (vehicle) => {
    const labels = {
      '2WHLR': '2-Wheeler',
      'LMV': 'Car',
      'HMV': 'Truck'
    };
    return labels[vehicle] || vehicle;
  };

  // Format alarm type
  const getAlarmName = (type) => {
    const names = {
      'wrong_lane': 'Wrong Lane Driving',
      'parked_vehicle': 'Parked Vehicle',
      'over_speeding': 'Over Speeding'
    };
    return names[type] || type.replace('_', ' ').toUpperCase();
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {getAlarmName(alarm.type)}
              </h2>
              <p className="text-sm text-gray-400">
                Alarm ID: {alarm.id}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Main Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Lane */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Lane</p>
              <p className="text-white text-lg font-semibold">{alarm.lane}</p>
            </div>

            {/* Vehicle Type */}
            {alarm.vehicle_type && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Vehicle Type</p>
                <p className="text-white text-lg font-semibold">
                  {getVehicleLabel(alarm.vehicle_type)}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 col-span-2">
              <p className="text-gray-400 text-sm mb-1">Detected At</p>
              <p className="text-white text-lg font-semibold">
                {formatTimestamp(alarm.timestamp)}
              </p>
            </div>

            {/* Duration (if parked vehicle) */}
            {alarm.duration && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Parked Duration</p>
                <p className="text-orange-400 text-lg font-bold">{alarm.duration}</p>
              </div>
            )}

            {/* Speed (if over speeding) */}
            {alarm.speed && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Speed</p>
                <p className="text-red-400 text-lg font-bold">{alarm.speed} km/h</p>
              </div>
            )}
          </div>

          {/* Message */}
          {alarm.message && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Details</p>
              <p className="text-white text-base leading-relaxed">{alarm.message}</p>
            </div>
          )}
          
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlarmDetailModal;
