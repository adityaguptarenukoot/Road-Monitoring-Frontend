import React, { useState, useEffect } from 'react';
import { useAlarmContext } from '../context/AlarmContext';

const LiveAlarmDashboard = ({ lane, videoUploaded, thresholdsCrossed = [] }) => {
  const { allAlarms } = useAlarmContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thresholdStatus, setThresholdStatus] = useState({
    '2WHLR': null,
    'LMV': null,
    'HMV': null
  });

  const laneAlarms = allAlarms
    .filter(alarm => alarm.lane && alarm.lane.toUpperCase() === lane.toUpperCase())
    .filter(alarm => alarm.status === 'active')
    .filter(alarm => alarm.type !== 'threshold_exceeded');

  useEffect(() => {
    console.log(`${lane} Lane - Received thresholds prop:`, thresholdsCrossed);
    
    if (!videoUploaded) {
      setThresholdStatus({ '2WHLR': null, 'LMV': null, 'HMV': null });
      return;
    }

    const laneThresholds = thresholdsCrossed.filter(
      t => t.lane && t.lane.toUpperCase() === lane.toUpperCase()
    );
    console.log(`${lane} Lane - Filtered thresholds:`, laneThresholds);
    
    const status = {
      '2WHLR': laneThresholds.find(t => t.vehicle_type === '2WHLR') || null,
      'LMV': laneThresholds.find(t => t.vehicle_type === 'LMV') || null,
      'HMV': laneThresholds.find(t => t.vehicle_type === 'HMV') || null
    };
    
    console.log(`${lane} Lane - Threshold status:`, status);
    setThresholdStatus(status);
  }, [thresholdsCrossed, videoUploaded, lane]);

  useEffect(() => {
    if (laneAlarms.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % laneAlarms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [laneAlarms.length]);

  const getAlarmName = (type) => {
    const names = {
      'wrong_lane': 'Wrong Lane Driving',
      'parked_vehicle': 'Parked Vehicle',
      'over_speeding': 'Over Speeding',
      'oppositeDriving': 'Opposite Driving'
    };
    return names[type] || type.replace('_', ' ').toUpperCase();
  };

  const getAlarmColor = (type) => {
    const colors = {
      'wrong_lane': 'bg-yellow-900/40 border-yellow-500',
      'parked_vehicle': 'bg-orange-900/40 border-orange-500',
      'over_speeding': 'bg-red-900/40 border-red-500',
      'oppositeDriving': 'bg-red-900/40 border-red-500'
    };
    return colors[type] || 'bg-red-900/40 border-red-500';
  };

  const getVehicleLabel = (vehicle) => {
    const labels = {
      '2WHLR': '2-Wheeler',
      'LMV': 'LMV (Car)',
      'HMV': 'HMV (Truck)'
    };
    return labels[vehicle] || vehicle;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const ThresholdCard = ({ vehicleType, label }) => {
    const status = thresholdStatus[vehicleType];
    const isViolated = status !== null;

    return (
      <div className={`border-l-4 rounded p-3 transition-all duration-300 ${
        isViolated
          ? 'bg-red-900/60 border-red-500 ring-2 ring-red-500 shadow-lg shadow-red-500/50 animate-pulse'
          : 'bg-gray-700/30 border-gray-600'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-bold text-sm ${
                isViolated ? 'text-red-400' : 'text-gray-500'
              }`}>
                Threshold: {label}
              </h4>
              {isViolated && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <div className="text-xs space-y-1">
              {isViolated ? (
                <>
                  <p className="font-medium text-gray-300">
                    Vehicle: {label}
                  </p>
                  <p className="text-gray-300">
                    Count: <span className="text-red-400 font-bold text-base">
                      {status.count}
                    </span> / {status.max_count}
                  </p>
                  <p className="text-gray-400 italic text-xs">
                    {status.message}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No violation</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-800 rounded-lg flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">
            {lane} Lane Alarms
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {laneAlarms.length} Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!videoUploaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs text-center">
              Upload video to start monitoring
            </p>
          </div>
        ) : (
          <>
            {laneAlarms.map((alarm, index) => (
              <div
                key={alarm.id}
                className={`${getAlarmColor(alarm.type)} border-l-4 rounded p-3 transition-all duration-300 ${
                  index === currentIndex 
                    ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/50 bg-red-900/60' 
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-red-400 font-bold text-sm">
                        {getAlarmName(alarm.type)}
                      </h4>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="text-gray-300 text-xs space-y-1">
                      {alarm.vehicle_type && (
                        <p className="font-medium">
                          Vehicle: {getVehicleLabel(alarm.vehicle_type)}
                        </p>
                      )}
                      
                      {alarm.speed && (
                        <p>Speed: <span className="text-red-400 font-bold">{alarm.speed} km/h</span></p>
                      )}
                      
                      {alarm.duration && (
                        <p>Duration: {alarm.duration}</p>
                      )}
                      
                      {alarm.message && (
                        <p className="text-gray-400 italic text-xs">
                          {alarm.message}
                        </p>
                      )}
                      
                      <p className="text-gray-500">
                        {formatTime(alarm.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <ThresholdCard vehicleType="2WHLR" label="2-Wheeler" />
            <ThresholdCard vehicleType="LMV" label="LMV (Car)" />
            <ThresholdCard vehicleType="HMV" label="HMV (Truck)" />

            {laneAlarms.length === 0 && (
              <div className="flex items-center justify-center py-4">
                <p className="text-gray-500 text-xs text-center">
                  No other active alarms
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {videoUploaded && (
        <div className="p-2 border-t border-gray-700 bg-gray-750">
          <p className="text-gray-400 text-xs text-center">
            Live Monitoring • {laneAlarms.length} Alarms
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveAlarmDashboard;
