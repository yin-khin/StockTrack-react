// src/api/category.api.js
import axios from './axios';

// Fetch all categories
export const fetchCategories = async () => {
  const response = await axios.get('/api/category');
  // Backend returns { category: [...], message: "..." }
  return response.data?.category || response.data || [];
};

// Fetch a single category by ID
export const fetchCategoryById = async (id) => {
  const response = await axios.get(`/api/category/${id}`);
  return response.data;
};

// Create a new category
export const createCategory = async (categoryData) => {
  const response = await axios.post('/api/category', categoryData);
  return response.data;
};

// Update an existing category by ID
export const updateCategory = async (id, categoryData) => {
  const response = await axios.put(`/api/category/${id}`, categoryData);
  return response.data;
};

// Delete a category by ID
export const deleteCategory = async (id) => {
  const response = await axios.delete(`/api/category/${id}`);
  return response.data;
};
