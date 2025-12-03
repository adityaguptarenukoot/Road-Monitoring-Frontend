import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const api = {
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

  getCurrentStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/stats/current`);
    return response.data;
  },

  resetStats: async () => {
    const response = await axios.post(`${API_BASE_URL}/stats/reset`);
    return response.data;
  },

  getThresholds: async () => {
    const response = await axios.get(`${API_BASE_URL}/thresholds`);
    return response.data;
  },

  updateThresholds: async (thresholds) => {
    const response = await axios.post(`${API_BASE_URL}/thresholds`, thresholds);
    return response.data;
  },

  stopProcessing: async () => {
    const response = await axios.post(`${API_BASE_URL}/stop-processing`);
    return response.data;
  },


  
  getAllAlarms: async () => {
    const response = await axios.get(`${API_BASE_URL}/alarms`);
    return response.data;
  },

  clearAlarms: async (alarmIds) => {
    const response = await axios.post(`${API_BASE_URL}/alarms/clear`, { 
      alarm_ids: alarmIds 
    });
    return response.data;
  },

  resetAlarms: async () => {
    const response = await axios.post(`${API_BASE_URL}/alarms/reset`);
    return response.data;
  },
};
