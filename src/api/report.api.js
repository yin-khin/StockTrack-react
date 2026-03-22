// src/api/report.api.js
import axios from './axios';

// Get imports report
export const getImportsReport = async (params = {}) => {
  const { startDate, endDate, supplierId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (supplierId) queryParams.append('supplierId', supplierId);
  
  const response = await axios.get(`/api/imports?${queryParams.toString()}`);
  return response.data;
};

// Get sales report
export const getSalesReport = async (params = {}) => {
  const { startDate, endDate, customerId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (customerId) queryParams.append('customerId', customerId);
  
  const response = await axios.get(`/api/sales?${queryParams.toString()}`);
  return response.data;
};

// Get profit report
export const getProfitReport = async (params = {}) => {
  const { startDate, endDate } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const response = await axios.get(`/api/profits?${queryParams.toString()}`);
  return response.data;
};

// Export Import Report (Excel)
export const exportImportReportExcel = async (params = {}) => {
  const { startDate, endDate, supplierId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (supplierId) queryParams.append('supplierId', supplierId);
  
  const response = await axios.get(`/api/reports/imports/excel?${queryParams.toString()}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response.data;
};

// Export Import Report (PDF)
export const exportImportReportPDF = async (params = {}) => {
  const { startDate, endDate, supplierId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (supplierId) queryParams.append('supplierId', supplierId);
  
  const response = await axios.get(`/api/reports/imports/pdf?${queryParams.toString()}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response.data;
};

// Export Sales Report (Excel)
export const exportSalesReportExcel = async (params = {}) => {
  const { startDate, endDate, customerId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (customerId) queryParams.append('customerId', customerId);
  
  const response = await axios.get(`/api/reports/sales/excel?${queryParams.toString()}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response.data;
};

// Export Sales Report (PDF)
export const exportSalesReportPDF = async (params = {}) => {
  const { startDate, endDate, customerId } = params;
  const queryParams = new URLSearchParams();
  
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (customerId) queryParams.append('customerId', customerId);
  
  const response = await axios.get(`/api/reports/sales/pdf?${queryParams.toString()}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response.data;
};

// Helper function to download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
