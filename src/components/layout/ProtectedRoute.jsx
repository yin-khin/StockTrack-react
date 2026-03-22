// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRole, hasPermission, hasAnyPermission } from '../../utils/permissions';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  requiredAnyPermission = null 
}) => {
  const { isAuthenticated, user } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(user, requiredRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Check any permission requirement
  if (requiredAnyPermission && !hasAnyPermission(user, requiredAnyPermission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default ProtectedRoute;
