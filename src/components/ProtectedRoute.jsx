import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication', { user, loading });

  if (loading) {
    console.log('ProtectedRoute: Still loading');
    return <div>Carregando...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering outlet');
  return <Outlet />;
};

export default ProtectedRoute;