// src/api/brand.api.js
import axios from './axios';

// Fetch all brands
export const fetchBrands = async () => {
  const response = await axios.get('/api/brands');
  // Backend returns { brand: [...], message: "..." }
  return response.data?.brand || response.data || [];
};

// Fetch a single brand by ID
export const fetchBrandById = async (id) => {
  const response = await axios.get(`/api/brands/${id}`);
  return response.data;
};

// Create a new brand
export const createBrand = async (brandData) => {
  const response = await axios.post('/api/brands', brandData);
  return response.data;
};

// Update an existing brand by ID
export const updateBrand = async (id, brandData) => {
  const response = await axios.put(`/api/brands/${id}`, brandData);
  return response.data;
};

// Delete a brand by ID
export const deleteBrand = async (id) => {
  const response = await axios.delete(`/api/brands/${id}`);
  return response.data;
};
