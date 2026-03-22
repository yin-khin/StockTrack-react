// src/api/settings.api.js
import axios from './axios';

// Get all settings
export const getSettings = async () => {
  try {
    const response = await axios.get('/api/settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update settings
export const updateSettings = async (settingsData) => {
  try {
    const response = await axios.put('/api/settings', settingsData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get specific setting by key
export const getSetting = async (key) => {
  try {
    const response = await axios.get(`/api/settings/${key}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update specific setting
export const updateSetting = async (key, value) => {
  try {
    const response = await axios.patch(`/api/settings/${key}`, { value });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset settings to default
export const resetSettings = async () => {
  try {
    const response = await axios.post('/api/settings/reset');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export settings
export const exportSettings = async () => {
  try {
    const response = await axios.get('/api/settings/export');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Import settings
export const importSettings = async (settingsData) => {
  try {
    const response = await axios.post('/api/settings/import', settingsData);
    return response.data;
  } catch (error) {
    throw error;
  }
};