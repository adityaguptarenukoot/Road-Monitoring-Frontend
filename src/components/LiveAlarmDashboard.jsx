import React, { useState, useEffect } from 'react';

const LiveAlarmDashboard = ({ lane, videoUploaded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

 
  const testAlarms = {
    OUT: [
      { id: 1, type: 'over_speeding', vehicle: 'LMV', speed: 85, time: '14:25:30' },
      { id: 2, type: 'parked_vehicle', vehicle: 'HMV', duration: '5 mins', time: '14:20:15' },
      { id: 3, type: 'wrong_lane', vehicle: '2WHLR', time: '14:18:42' },
    ],
    IN: [
      { id: 4, type: 'over_speeding', vehicle: '2WHLR', speed: 92, time: '14:22:18' },
      { id: 5, type: 'wrong_lane', vehicle: 'LMV', time: '14:19:55' },
      { id: 6, type: 'over_speeding', vehicle: 'LMV', speed: 78, time: '14:15:30' },
    ]
  };

  const alarms = videoUploaded ? (testAlarms[lane] || []) : [];

  
  useEffect(() => {
    if (alarms.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % alarms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [alarms.length]);

  const getAlarmName = (type) => {
    const names = {
      'over_speeding': 'Over Speeding',
      'wrong_lane': 'Wrong Lane Driving',
      'parked_vehicle': 'Parked Vehicle'
    };
    return names[type] || type;
  };

  const getAlarmColor = (type) => {
    const colors = {
      'over_speeding': 'bg-red-900/40 border-red-500',
      'wrong_lane': 'bg-yellow-900/40 border-yellow-500',
      'parked_vehicle': 'bg-orange-900/40 border-orange-500'
    };
    return colors[type] || 'bg-red-900/40 border-red-500';
  };

  return (
    <div className="h-full bg-gray-800 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">
          {lane} Lane Alarms
        </h3>
      </div>

      {/* Alarms List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!videoUploaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs text-center">
              Upload video to start monitoring
            </p>
          </div>
        ) : alarms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs text-center">
              No active alarms<br />
              <span className="text-gray-600">All clear</span>
            </p>
          </div>
        ) : (
          alarms.map((alarm, index) => (
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
                  {/* Alarm Name with Red Dot After */}
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-red-400 font-bold text-sm">
                      {getAlarmName(alarm.type)}
                    </h4>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Details */}
                  <div className="text-gray-300 text-xs space-y-1">
                    <p className="font-medium">Vehicle: {alarm.vehicle}</p>
                    {alarm.speed && <p>Speed: {alarm.speed} km/h</p>}
                    {alarm.duration && <p>Duration: {alarm.duration}</p>}
                    <p className="text-gray-500">{alarm.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {videoUploaded && alarms.length > 0 && (
        <div className="p-2 border-t border-gray-700 bg-gray-750">
          <p className="text-gray-400 text-xs text-center">
            Live Monitoring • {alarms.length} Active
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveAlarmDashboard;
