// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Check for existing auth on mount
  useEffect(() => {
    // console.log('AuthContext: Checking for existing auth...');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // console.log(' AuthContext: Token in localStorage:', token ? 'Present' : 'Missing');
    // console.log('AuthContext: User in localStorage:', userStr ? 'Present' : 'Missing');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ensure permissions array exists
        if (!user.permissions) {
          user.permissions = [];
        }
        // console.log(' AuthContext: Setting authenticated state for user:', user.username);
        setAuth({
          isAuthenticated: true,
          user,
          token,
        });
      } catch (error) {
        // console.error('AuthContext: Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // console.log(' AuthContext: No valid auth found, staying unauthenticated');
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  const value = {
    auth,
    setAuth,
    logout,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
