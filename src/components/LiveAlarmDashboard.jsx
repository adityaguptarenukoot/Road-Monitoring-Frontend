import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const LiveAlarmDashboard = ({ lane, videoUploaded, pollingInterval = 5 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [alarms, setAlarms] = useState([]);
  const [thresholdStatus, setThresholdStatus] = useState({
    '2WHLR': null,
    'LMV': null,
    'HMV': null
  });
  const [loading, setLoading] = useState(false);

  // Fetch regular alarms (NOT threshold_exceeded)
  useEffect(() => {
    const fetchAlarms = async () => {
      if (!videoUploaded) {
        setAlarms([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getAllAlarms();
        
        // Filter alarms by lane, EXCLUDE threshold_exceeded
        const laneAlarms = response.alarms
          .filter(alarm => alarm.lane.toUpperCase() === lane.toUpperCase())
          .filter(alarm => alarm.status === 'active')
          .filter(alarm => alarm.type !== 'threshold_exceeded');
        
        setAlarms(laneAlarms);
      } catch (error) {
        console.error('Failed to fetch alarms:', error);
        setAlarms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlarms();
    const interval = setInterval(fetchAlarms, pollingInterval * 1000);
    return () => clearInterval(interval);
  }, [videoUploaded, lane, pollingInterval]);

  // Fetch threshold status from stats (for highlighting)
  useEffect(() => {
    const fetchThresholdStatus = async () => {
      if (!videoUploaded) {
        setThresholdStatus({ '2WHLR': null, 'LMV': null, 'HMV': null });
        return;
      }

      try {
        const response = await api.getCurrentStats();
        const thresholds = response.thresholds_crossed || [];
        
        // Filter by lane
        const laneThresholds = thresholds.filter(
          t => t.lane.toLowerCase() === lane.toLowerCase()
        );
        
        // Create status object
        const status = {
          '2WHLR': laneThresholds.find(t => t.vehicle_type === '2WHLR') || null,
          'LMV': laneThresholds.find(t => t.vehicle_type === 'LMV') || null,
          'HMV': laneThresholds.find(t => t.vehicle_type === 'HMV') || null
        };
        
        setThresholdStatus(status);
      } catch (error) {
        console.error('Failed to fetch threshold status:', error);
      }
    };

    fetchThresholdStatus();
    const interval = setInterval(fetchThresholdStatus, pollingInterval * 1000);
    return () => clearInterval(interval);
  }, [videoUploaded, lane, pollingInterval]);

  // Auto-rotate highlighted alarm (only regular alarms, not threshold slots)
  useEffect(() => {
    if (alarms.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % alarms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [alarms.length]);

  // Format alarm type name
  const getAlarmName = (type) => {
    const names = {
      'wrong_lane': 'Wrong Lane Driving',
      'parked_vehicle': 'Parked Vehicle',
      'over_speeding': 'Over Speeding'
    };
    return names[type] || type.replace('_', ' ').toUpperCase();
  };

  // Get alarm color scheme
  const getAlarmColor = (type) => {
    const colors = {
      'wrong_lane': 'bg-yellow-900/40 border-yellow-500',
      'parked_vehicle': 'bg-orange-900/40 border-orange-500',
      'over_speeding': 'bg-red-900/40 border-red-500'
    };
    return colors[type] || 'bg-red-900/40 border-red-500';
  };

  // Get vehicle label
  const getVehicleLabel = (vehicle) => {
    const labels = {
      '2WHLR': '2-Wheeler',
      'LMV': 'LMV (Car)',
      'HMV': 'HMV (Truck)'
    };
    return labels[vehicle] || vehicle;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="h-full bg-gray-800 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">
            {lane} Lane Alarms
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {alarms.length} Active
            </span>
            {loading && (
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>

      {/* All Alarms (Regular + Threshold Slots) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!videoUploaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs text-center">
              Upload video to start monitoring
            </p>
          </div>
        ) : (
          <>
            {/* Regular Stored Alarms */}
            {alarms.map((alarm, index) => (
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
                    {/* Alarm Name with Pulse Dot */}
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-red-400 font-bold text-sm">
                        {getAlarmName(alarm.type)}
                      </h4>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Details */}
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

            {/* Threshold Slots (Always Visible) */}
            {/* 2WHLR Threshold */}
            <div className={`border-l-4 rounded p-3 transition-all duration-300 ${
              thresholdStatus['2WHLR']
                ? 'bg-red-900/60 border-red-500 ring-2 ring-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-gray-700/30 border-gray-600'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-bold text-sm ${
                      thresholdStatus['2WHLR'] ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      Threshold: 2-Wheeler
                    </h4>
                    {thresholdStatus['2WHLR'] && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {thresholdStatus['2WHLR'] ? (
                      <>
                        <p className="font-medium text-gray-300">
                          Vehicle: 2-Wheeler
                        </p>
                        <p className="text-gray-300">
                          Count: <span className="text-red-400 font-bold">
                            {thresholdStatus['2WHLR'].count}
                          </span> / {thresholdStatus['2WHLR'].max_count}
                        </p>
                        <p className="text-gray-400 italic text-xs">
                          {thresholdStatus['2WHLR'].message}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">No threshold violation</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* LMV Threshold */}
            <div className={`border-l-4 rounded p-3 transition-all duration-300 ${
              thresholdStatus['LMV']
                ? 'bg-red-900/60 border-red-500 ring-2 ring-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-gray-700/30 border-gray-600'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-bold text-sm ${
                      thresholdStatus['LMV'] ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      Threshold: LMV (Car)
                    </h4>
                    {thresholdStatus['LMV'] && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {thresholdStatus['LMV'] ? (
                      <>
                        <p className="font-medium text-gray-300">
                          Vehicle: LMV (Car)
                        </p>
                        <p className="text-gray-300">
                          Count: <span className="text-red-400 font-bold">
                            {thresholdStatus['LMV'].count}
                          </span> / {thresholdStatus['LMV'].max_count}
                        </p>
                        <p className="text-gray-400 italic text-xs">
                          {thresholdStatus['LMV'].message}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">No threshold violation</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* HMV Threshold */}
            <div className={`border-l-4 rounded p-3 transition-all duration-300 ${
              thresholdStatus['HMV']
                ? 'bg-red-900/60 border-red-500 ring-2 ring-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-gray-700/30 border-gray-600'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-bold text-sm ${
                      thresholdStatus['HMV'] ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      Threshold: HMV (Truck)
                    </h4>
                    {thresholdStatus['HMV'] && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {thresholdStatus['HMV'] ? (
                      <>
                        <p className="font-medium text-gray-300">
                          Vehicle: HMV (Truck)
                        </p>
                        <p className="text-gray-300">
                          Count: <span className="text-red-400 font-bold">
                            {thresholdStatus['HMV'].count}
                          </span> / {thresholdStatus['HMV'].max_count}
                        </p>
                        <p className="text-gray-400 italic text-xs">
                          {thresholdStatus['HMV'].message}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">No threshold violation</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Empty state if no regular alarms */}
            {alarms.length === 0 && (
              <div className="flex items-center justify-center py-4">
                <p className="text-gray-500 text-xs text-center">
                  No other active alarms
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {videoUploaded && (
        <div className="p-2 border-t border-gray-700 bg-gray-750">
          <p className="text-gray-400 text-xs text-center">
            Live Monitoring • {alarms.length} Alarms
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveAlarmDashboard;
