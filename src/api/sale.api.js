// src/api/sale.api.js
import axios from './axios';

// Fetch all sales
export const fetchSales = async () => {
  const response = await axios.get('/api/sales');
  // Backend returns { success: true, data: [...], message: "..." }
  return response.data?.data || response.data || [];
};

// Create a new sale
export const createSale = async (saleData) => {
  const response = await axios.post('/api/sales', saleData);
  return response.data;
};

// Update an existing sale
export const updateSale = async (id, saleData) => {
  const response = await axios.put(`/api/sales/${id}`, saleData);
  return response.data;
};

// Delete a sale
export const deleteSale = async (id) => {
  const response = await axios.delete(`/api/sales/${id}`);
  return response.data;
};

// Get sale by ID
export const getSaleById = async (id) => {
  const response = await axios.get(`/api/sales/${id}`);
  return response.data;
};

// Sale data structure expected:
// {
//   customer_id: 1,
//   items: [
//     {
//       product_id: 1,
//       quantity: 2,
//       unit_price: 900.00
//     }
//   ],
//   discount: 50.00,
//   paid: 1750.00
// }
