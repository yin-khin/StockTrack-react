// src/api/role.api.js
import axios from './axios';

// Fetch all roles
export const fetchRoles = async () => {
  const response = await axios.get('/api/roles');
  return response.data;
};

// Fetch a single role by ID
export const fetchRoleById = async (id) => {
  const response = await axios.get(`/api/roles/${id}`);
  return response.data;
};

// Create a new role
export const createRole = async (roleData) => {
  const response = await axios.post('/api/roles', roleData);
  return response.data;
};

// Update an existing role by ID
export const updateRole = async (id, roleData) => {
  const response = await axios.put(`/api/roles/${id}`, roleData);
  return response.data;
};

// Delete a role by ID
export const deleteRole = async (id) => {
  const response = await axios.delete(`/api/roles/${id}`);
  return response.data;
};
