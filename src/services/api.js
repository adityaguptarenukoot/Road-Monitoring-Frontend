import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const api = {
  // Upload video file
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await axios.post(`${API_BASE_URL}/upload-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get current statistics
  getCurrentStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/stats/current`);
    return response.data;
  },

  // Reset statistics
  resetStats: async () => {
    const response = await axios.post(`${API_BASE_URL}/stats/reset`);
    return response.data;
  },

  // Stop video processing
  stopProcessing: async () => {
    const response = await axios.post(`${API_BASE_URL}/stop-processing`);
    return response.data;
  },

  // Get all alarms
  getAllAlarms: async () => {
    const response = await axios.get(`${API_BASE_URL}/alarms`);
    console.log(response);
    return response.data;
  },

  // Clear specific alarms
  clearAlarms: async (alarmIds) => {
    const response = await axios.post(`${API_BASE_URL}/alarms/clear`, { 
      alarm_ids: alarmIds 
    });
    return response.data;
  },

  // Reset all alarms
  resetAlarms: async () => {
    const response = await axios.post(`${API_BASE_URL}/alarms/reset`);
    return response.data;
  },

  // Get current thresholds
  getThresholds: async () => {
    const response = await axios.get(`${API_BASE_URL}/thresholds`);
    return response.data;
  },

  // Update thresholds
  updateThresholds: async (thresholds) => {
    const response = await axios.post(`${API_BASE_URL}/thresholds`, { 
      thresholds 
    });
    return response.data;
  },

  // Update backend polling rate
  updatePollingRate: async (intervalSeconds) => {
    const response = await axios.post(`${API_BASE_URL}/polling-rate`, {
      interval: intervalSeconds
    });
    return response.data;
  },

  // Get current backend polling rate
  getPollingRate: async () => {
    const response = await axios.get(`${API_BASE_URL}/polling-rate`);
    return response.data;
  },
};
