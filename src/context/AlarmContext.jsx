import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socket';
import { api } from '../services/api';

const AlarmContext = createContext(null);

export const useAlarmContext = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarmContext must be used within AlarmProvider');
  }
  return context;
};

export const AlarmProvider = ({ children }) => {
  const [allAlarms, setAllAlarms] = useState([]);
  const [selectedAlarm, setSelectedAlarm] = useState(null);

  const transformBackendAlarm = (backendAlarm) => {
    const alarmId = backendAlarm.alarmId ? backendAlarm.alarmId[0] : Date.now();
    const alarmType = backendAlarm.defaultCause ? backendAlarm.defaultCause[0] : 'unknown';
    const vehicleType = backendAlarm.vehicle ? backendAlarm.vehicle.vehicleType : null;
    const direction = backendAlarm.vehicle ? backendAlarm.vehicle.direction : null;
    const alarmStatus = backendAlarm.status === 'open' ? 'active' : 'resolved';
    const dateTime = backendAlarm.dateTime ? backendAlarm.dateTime[0] : new Date().toISOString();
    const description = backendAlarm.description ? backendAlarm.description[0] : '';
    const severity = backendAlarm.severity ? backendAlarm.severity[0] : 'info';
    const vehicleId = backendAlarm.vehicle ? backendAlarm.vehicle.id : null;

    let lane = 'UNKNOWN';
    if (direction === 'incoming') {
      lane = 'IN';
    } else if (direction === 'outgoing') {
      lane = 'OUT';
    }

    return {
      id: alarmId,
      type: alarmType,
      vehicle_type: vehicleType,
      lane: lane,
      status: alarmStatus,
      timestamp: dateTime,
      message: description,
      severity: severity,
      vehicle_id: vehicleId,
      cameraId: backendAlarm.cameraId,
      image: backendAlarm.image ? backendAlarm.image[0] : null,
    };
  };

  useEffect(() => {
    const fetchInitialAlarms = async () => {
      try {
        const response = await api.getAllAlarms();
        const alarms = response.alarms || [];
        
        const transformedAlarms = alarms.map(alarm => {
          if (alarm.alarmId || alarm.defaultCause) {
            return transformBackendAlarm(alarm);
          }
          return alarm;
        });
        
        setAllAlarms(transformedAlarms);
      } catch (error) {
        console.error('Failed to fetch initial alarms:', error);
      }
    };

    fetchInitialAlarms();
  }, []);

  useEffect(() => {
    const socket = socketService.connect();

    socketService.on('broadcaster', (backendAlarm) => {
      console.log('New alarm received:', backendAlarm);
      
      const transformedAlarm = transformBackendAlarm(backendAlarm);
      
      setAllAlarms(prev => [transformedAlarm, ...prev]);
    });

    socketService.on('alarm_added', (alarm) => {
      const needsTransform = alarm.alarmId || alarm.defaultCause;
      const transformedAlarm = needsTransform ? transformBackendAlarm(alarm) : alarm;
      
      setAllAlarms(prev => [transformedAlarm, ...prev]);
    });

    return () => {
      socketService.off('broadcaster');
      socketService.off('alarm_added');
    };
  }, []);

  const deleteAlarm = (alarmId) => {
    setAllAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
  };

  const clearAllAlarms = () => {
    setAllAlarms([]);
  };

  const openAlarmDetail = (alarm) => {
    setSelectedAlarm(alarm);
  };

  const closeAlarmDetail = () => {
    setSelectedAlarm(null);
  };

  const value = {
    allAlarms,
    selectedAlarm,
    deleteAlarm,
    clearAllAlarms,
    openAlarmDetail,
    closeAlarmDetail,
    setSelectedAlarm
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
    </AlarmContext.Provider>
  );
};
