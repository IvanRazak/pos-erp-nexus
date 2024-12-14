import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, route }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions(user?.role);
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    if (authLoading || permissionsLoading) {
      timeoutId = setTimeout(() => {
        setShouldRedirect(true);
        toast.error('Tempo de carregamento excedido. Redirecionando para o login...');
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [authLoading, permissionsLoading]);

  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (route && !hasPermission(route)) {
    toast.error('Você não tem permissão para acessar esta página');
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
