import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AlarmDetailModal from './AlarmDetailModal';

const AlarmHistory = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch alarms on mount and every 5 seconds
  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const response = await api.getAllAlarms();
      
      // Filter: Only violations (exclude thresholds)
      const filteredAlarms = response.alarms
        .filter(alarm => 
          alarm.type === 'wrong_lane' || 
          alarm.type === 'parked_vehicle' ||
          alarm.type === 'over_speeding'
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Latest first
      
      setAlarms(filteredAlarms);
    } catch (error) {
      console.error('Failed to fetch alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (alarm) => {
    setSelectedAlarm(alarm);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlarm(null);
  };

  // ========================================
  // 🆕 FIXED DELETE FUNCTION
  // ========================================
  const handleDelete = async (alarmId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Delete this alarm? This cannot be undone.')) return;
    
    try {
      console.log(`Deleting alarm: ${alarmId}`);
      
      const response = await fetch(`http://localhost:5001/api/alarms/delete/${alarmId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (response.ok) {
        console.log('✓ Alarm deleted successfully');
        fetchAlarms(); // Refresh list
      } else {
        console.error('✗ Delete failed:', data.message);
        alert(`Failed to delete alarm: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete alarm:', error);
      alert(`Error deleting alarm: ${error.message}\n\nMake sure backend is running on port 5001`);
    }
  };

  // ========================================
  // 🆕 FIXED DELETE ALL FUNCTION
  // ========================================
  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all alarms? This cannot be undone.')) return;
    
    try {
      console.log('Deleting all alarms...');
      
      const response = await fetch('http://localhost:5001/api/alarms/delete-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete all response:', data);
      
      if (response.ok) {
        console.log(`✓ ${data.deleted_count} alarms deleted successfully`);
        fetchAlarms(); // Refresh list
      } else {
        console.error('✗ Delete all failed:', data.message);
        alert(`Failed to delete alarms: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete all alarms:', error);
      alert(`Error deleting alarms: ${error.message}\n\nMake sure backend is running on port 5001`);
    }
  };

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

  // Get alarm color
  const getAlarmColor = (type) => {
    const colors = {
      'wrong_lane': 'border-l-yellow-500',
      'parked_vehicle': 'border-l-orange-500',
      'over_speeding': 'border-l-red-500'
    };
    return colors[type] || 'border-l-red-500';
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full bg-gray-800 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Alarm History</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{alarms.length} Total</span>
            {alarms.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && alarms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alarms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xs text-center">
              No alarms recorded
            </p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`bg-gray-900/50 border-l-4 ${getAlarmColor(alarm.type)} border-r border-t border-b border-gray-700 rounded-lg p-3 hover:bg-gray-900/70 transition-colors cursor-pointer`}
              onClick={() => handleViewDetails(alarm)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {getAlarmName(alarm.type)}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2">
                    {getVehicleLabel(alarm.vehicle_type)} • {alarm.lane} Lane
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatTime(alarm.timestamp)}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(alarm);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors whitespace-nowrap"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => handleDelete(alarm.id, e)}
                    className="px-3 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AlarmDetailModal
        alarm={selectedAlarm}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AlarmHistory;
