// src/api/payment.api.js
import axios from './axios';

// Fetch all payments
export const fetchPayments = async () => {
  const response = await axios.get('/api/payments');
  // Backend returns { success: true, data: [...], message: "..." }
  return response.data?.data || response.data || [];
};

// Fetch a single payment by ID
export const fetchPaymentById = async (id) => {
  const response = await axios.get(`/api/payments/${id}`);
  return response.data?.data || response.data;
};

// Create a new payment
export const createPayment = async (paymentData) => {
  const response = await axios.post('/api/payments', paymentData);
  return response.data;
};

// Update an existing payment by ID
export const updatePayment = async (id, paymentData) => {
  const response = await axios.put(`/api/payments/${id}`, paymentData);
  return response.data;
};

// Delete a payment by ID
export const deletePayment = async (id) => {
  const response = await axios.delete(`/api/payments/${id}`);
  return response.data;
};