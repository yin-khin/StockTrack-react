// src/api/supplier.api.js
import axios from './axios';

// Fetch all suppliers
export const fetchSuppliers = async () => {
  const response = await axios.get('/api/supplier');
  // Handle both response formats for backward compatibility
  return response.data.suppliers || response.data.supplier || response.data;
};

// Fetch a single supplier by ID
export const fetchSupplierById = async (id) => {
  const response = await axios.get(`/api/supplier/${id}`);
  // Handle both response formats for backward compatibility
  return response.data.supplier || response.data;
};

// Create a new supplier
export const createSupplier = async (supplierData) => {
  const response = await axios.post('/api/supplier', supplierData);
  // Return the created supplier object
  return response.data.newSupplier || response.data;
};

// Update an existing supplier by ID
export const updateSupplier = async (id, supplierData) => {
  const response = await axios.put(`/api/supplier/${id}`, supplierData);
  // Return the updated supplier object
  return response.data.supplier || response.data;
};

// Delete a supplier by ID
export const deleteSupplier = async (id) => {
  const response = await axios.delete(`/api/supplier/${id}`);
  return response.data;
};
