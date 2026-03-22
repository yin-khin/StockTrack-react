// src/api/permission.api.js
import axios from './axios';

// Get current user's permissions
export const getUserPermissions = async () => {
  const response = await axios.get('/user/permissions');
  return response.data;
};

// Get current user details with permissions
export const getCurrentUser = async () => {
  const response = await axios.get('/user/me');
  return response.data;
};
