// src/api/notification.api.js
import axios from './axios';

// Fetch all notifications
export const fetchNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly);
    
    const response = await axios.get(`/api/notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get notification by ID
export const getNotificationById = async (id) => {
  try {
    const response = await axios.get(`/api/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get('/api/notifications/unread/count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create notification (for testing)
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post('/api/notifications', notificationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axios.patch(`/api/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch('/api/notifications/read/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`/api/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create sample notifications (for testing all notification types)
export const createSampleNotifications = async () => {
  try {
    const response = await axios.post('/api/notifications/samples/create');
    return response.data;
  } catch (error) {
    throw error;
  }
};
