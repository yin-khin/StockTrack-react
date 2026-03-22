// src/api/customer.api.js
import axios from './axios';

// Fetch all customers
export const fetchCustomers = async () => {
  const response = await axios.get('/api/customers');
  return response.data;
};

// Fetch a single customer by ID
export const fetchCustomerById = async (id) => {
  const response = await axios.get(`/api/customers/${id}`);
  return response.data;
};

// Create a new customer
export const createCustomer = async (customerData) => {
  const response = await axios.post('/api/customers', customerData);
  return response.data;
};

// Update an existing customer by ID
export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`/api/customers/${id}`, customerData);
  return response.data;
};

// Delete a customer by ID
export const deleteCustomer = async (id) => {
  const response = await axios.delete(`/api/customers/${id}`);
  return response.data;
};
