// src/api/auth.api.js
import axios from './axios';

export const login = async (credentials) => {
  const response = await axios.post('/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post('/register', userData);
  return response.data;
};

export const sendOTP = async (email) => {
  const response = await axios.post('/user/send-otp', { email });
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await axios.post('/user/verify-otp', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await axios.post('/user/reset-password', data);
  return response.data;
};

export const getUserDetails = async (id) => {
  const response = await axios.get(`/user/${id}`);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get('/user/me');
  return response.data;
};

export const getUserPermissions = async () => {
  const response = await axios.get('/user/permissions');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get('/api/user');
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`/user/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`/user/${id}`);
  return response.data;
};
