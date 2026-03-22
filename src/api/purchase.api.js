// src/api/purchase.api.js
import axios from './axios';

// Fetch all purchases
export const fetchPurchases = async () => {
  const response = await axios.get('/api/purchase');
  return response.data;
};

// Fetch a single purchase by ID
export const fetchPurchaseById = async (id) => {
  const response = await axios.get(`/api/purchase/${id}`);
  return response.data;
};

// Create a new purchase
export const createPurchase = async (purchaseData) => {
  const response = await axios.post('/api/purchase', purchaseData);
  return response.data;
};

// Update an existing purchase by ID
export const updatePurchase = async (id, purchaseData) => {
  const response = await axios.put(`/api/purchase/${id}`, purchaseData);
  return response.data;
};

// Delete a purchase by ID
export const deletePurchase = async (id) => {
  const response = await axios.delete(`/api/purchase/${id}`);
  return response.data;
};

// Purchase Items API
export const fetchPurchaseItems = async () => {
  const response = await axios.get('/api/purchaseItem');
  // Handle response format for purchase items
  return response.data.purchaseItems || response.data;
};

export const fetchPurchaseItemById = async (id) => {
  const response = await axios.get(`/api/purchaseItem/${id}`);
  // Handle response format for purchase item
  return response.data.purchaseItem || response.data;
};

export const createPurchaseItem = async (itemData) => {
  const response = await axios.post('/api/purchaseItem', itemData);
  // Handle response format for created purchase item
  return response.data.newPurchaseItem || response.data;
};

export const updatePurchaseItem = async (id, itemData) => {
  const response = await axios.put(`/api/purchaseItem/${id}`, itemData);
  // Handle response format for updated purchase item
  return response.data.purchaseItem || response.data;
};

export const deletePurchaseItem = async (id) => {
  const response = await axios.delete(`/api/purchaseItem/${id}`);
  // Handle response format for deleted purchase item
  return response.data.purchaseItem || response.data;
};
