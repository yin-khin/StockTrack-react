// src/api/product.api.js
import axios from './axios';

// Fetch all products
export const fetchProducts = async (params = {}) => {
  const response = await axios.get('/api/products', { params });
  // Backend returns { product: [...], message: "..." }
  return response.data?.product || response.data || [];
};

// Fetch a single product by ID
export const fetchProductById = async (id) => {
  const response = await axios.get(`/api/products/${id}`);
  // Backend returns product object directly or wrapped
  return response.data?.product || response.data;
};

// Create a new product
export const createProduct = async (productData) => {
  const response = await axios.post('/api/products', productData);
  return response.data;
};

// Update an existing product by ID
export const updateProduct = async (id, productData) => {
  const response = await axios.put(`/api/products/${id}`, productData);
  return response.data;
};

// Delete a product by ID
export const deleteProduct = async (id) => {
  const response = await axios.delete(`/api/products/${id}`);
  return response.data;
};

// import axios from "./axios";

// // Fetch all products (with pagination + filters)
// export const fetchProducts = async (params = {}) => {
//   const res = await axios.get("/api/products", { params });
//   const body = res.data || {};

//   return {
//     items: Array.isArray(body.product) ? body.product : [],
//     total: Number(body.total ?? 0),
//     page: Number(body.page ?? params.page ?? 1),
//     limit: Number(body.limit ?? params.limit ?? 12),
//     totalPages: Number(body.totalPages ?? 1),
//     message: body.message,
//   };
// };

// // Fetch a single product by ID
// export const fetchProductById = async (id) => {
//   const res = await axios.get(`/api/products/${id}`);
//   return res.data?.product || res.data;
// };

// // Create a new product
// export const createProduct = async (productData) => {
//   const res = await axios.post("/api/products", productData);
//   return res.data;
// };

// // Update an existing product by ID
// export const updateProduct = async (id, productData) => {
//   const res = await axios.put(`/api/products/${id}`, productData);
//   return res.data;
// };

// // Delete a product by ID
// export const deleteProduct = async (id) => {
//   const res = await axios.delete(`/api/products/${id}`);
//   return res.data;
// };
