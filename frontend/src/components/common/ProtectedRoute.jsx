import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If student attempts to access admin route, redirect to student dashboard
    if (requiredRole === 'admin' && role === 'student') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin attempts to access student dashboard, redirect to admin dashboard
    if (requiredRole === 'student' && role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};
