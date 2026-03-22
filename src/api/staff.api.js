// src/api/staff.api.js
import axios from './axios';

// Get all staff
export const fetchAllStaff = async () => {
  try {
    const response = await axios.get('/api/staff');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get staff by ID
export const getStaffById = async (id) => {
  try {
    const response = await axios.get(`/api/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new staff
export const createStaff = async (staffData) => {
  try {
    const response = await axios.post('/api/staff', staffData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update staff
export const updateStaff = async (id, staffData) => {
  try {
    const response = await axios.put(`/api/staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete staff
export const deleteStaff = async (id) => {
  try {
    const response = await axios.delete(`/api/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle staff status
export const toggleStaffStatus = async (id) => {
  try {
    const response = await axios.patch(`/api/staff/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
