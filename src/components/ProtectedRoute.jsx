import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Loading:', loading);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;