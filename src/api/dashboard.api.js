// src/api/dashboard.api.js
import axios from './axios';

export const fetchDashboardData = async () => {
  const response = await axios.get('/api/dashboard');
  return response.data;
};
