import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AlarmHistory = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlarms, setSelectedAlarms] = useState([]);

  
  const fetchAlarms = async () => {
    try {
      const response = await api.getAllAlarms();
      setAlarms(response.alarms || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch alarms:', error);
      setLoading(false);
    }
  };

  // Fetch on mount and every 5 seconds
  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 5000);
    return () => clearInterval(interval);
  }, []);

  
  const toggleAlarm = (alarmId) => {
    setSelectedAlarms(prev => 
      prev.includes(alarmId) 
        ? prev.filter(id => id !== alarmId)
        : [...prev, alarmId]
    );
  };

  
  const handleClearSelected = async () => {
    if (selectedAlarms.length === 0) return;
    
    try {
      await api.clearAlarms(selectedAlarms);
      setSelectedAlarms([]);
      fetchAlarms(); 
    } catch (error) {
      console.error('Failed to clear alarms:', error);
    }
  };

  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get alarm display name
  const getAlarmName = (type) => {
    const names = {
      'over_speeding': 'Over Speeding',
      'wrong_lane': 'Wrong Lane Driving',
      'parked_vehicle': 'Parked Vehicle'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
        <p className="text-gray-400">Loading alarms...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 rounded-lg flex flex-col">
      
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
           Alarm History
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Total: {alarms.length} alarms
        </p>
      </div>

      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No alarms recorded yet
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`bg-gray-700 rounded-lg p-3 border-l-4 ${
                alarm.status === 'cleared' 
                  ? 'border-gray-500 opacity-60' 
                  : 'border-red-500'
              }`}
            >
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedAlarms.includes(alarm.id)}
                  onChange={() => toggleAlarm(alarm.id)}
                  className="mt-1 w-4 h-4 cursor-pointer"
                  disabled={alarm.status === 'cleared'}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-lg"></span>
                    <h3 className="text-white font-semibold">
                      {getAlarmName(alarm.type)}
                    </h3>
                    {alarm.status === 'cleared' && (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        Cleared
                      </span>
                    )}
                  </div>

                  
                  <div className="mt-2 space-y-1 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      
                      <span>{formatDate(alarm.timestamp)}</span>
                      <span>|</span>
                      
                      <span>{formatTime(alarm.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      
                      <span>Lane: {alarm.lane}</span>
                      {alarm.speed && (
                        <>
                          <span>|</span>
                          <span>Speed: {alarm.speed} km/h</span>
                        </>
                      )}
                      {alarm.vehicle_type && (
                        <>
                          <span>|</span>
                          <span>Vehicle: {alarm.vehicle_type}</span>
                        </>
                      )}
                      {alarm.duration && (
                        <>
                          <span>|</span>
                          <span>Duration: {alarm.duration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  
                  <button
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    disabled
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      
      {selectedAlarms.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-750">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">
              Selected: {selectedAlarms.length} alarm{selectedAlarms.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearSelected}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              🗑️ Clear Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmHistory;
