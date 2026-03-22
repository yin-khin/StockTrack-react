// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notification.api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth context
  const { isAuthenticated, token } = useAuth();

  // console.log('NotificationProvider: Current state', {
  //   notificationsCount: notifications.length,
  //   unreadCount,
  //   loading,
  //   error,
  //   isAuthenticated,
  //   hasToken: !!token
  // });

  // Fetch notifications
  const loadNotifications = async (params = {}) => {
    try {
      // console.log('🔄 loadNotifications called with params:', params);
      // console.log('🔄 Current auth state - isAuthenticated:', isAuthenticated, 'token:', token ? 'Present' : 'Missing');

      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        console.warn("⚠️ User not authenticated, skipping notification load");
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // console.log('📡 Making API call to fetchNotifications...');
      const response = await fetchNotifications(params);
      // console.log('📡 Raw API response:', response);

      if (response && response.success !== false) {
        const notifications =
          response.data?.notifications || response.notifications || [];
        const unreadCount =
          response.data?.unreadCount || response.unreadCount || 0;

        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } else {
        console.error("❌ API returned error response:", response);
        setError(response?.message || "Failed to load notifications");
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      // console.error('❌ Exception in loadNotifications:', error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load notifications",
        );
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      // console.log('🏁 loadNotifications finished, setting loading to false');
      setLoading(false);
    }
  };

  // Load unread count only
  const loadUnreadCount = async () => {
    try {
      if (!isAuthenticated || !token) {
        return;
      }

      const response = await getUnreadCount();
      if (response.success !== false) {
        setUnreadCount(response.data?.unreadCount || response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await markNotificationAsRead(id);
      if (response.success !== false) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification,
          ),
        );
        setUnreadCount(response.data?.unreadCount || 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success !== false) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, is_read: true })),
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  };

  // Auto-load notifications when user becomes authenticated
  useEffect(() => {
    // console.log('🔐 NotificationContext useEffect triggered');
    // console.log('🔐 isAuthenticated:', isAuthenticated);
    // console.log('🔐 token:', token ? 'Present' : 'Missing');

    if (isAuthenticated && token) {
      // console.log('🔐 User authenticated, loading notifications...');
      loadNotifications();
      loadUnreadCount();

      // Set up auto-refresh interval
      const interval = setInterval(() => {
        // console.log('🔄 Auto-refresh: loading unread count...');
        loadUnreadCount();
      }, 30000); // 30 seconds

      return () => {
        // console.log('🧹 Cleaning up notification interval');
        clearInterval(interval);
      };
    } else {
      // console.log('🚫 User not authenticated, clearing notifications...');
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, token]); // Only depend on auth state

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
