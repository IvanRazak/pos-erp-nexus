import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePermissions = (role) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      fetchPermissions();
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      if (role === 'admin') {
        // Admin tem todas as permissões
        setPermissions(['clientes', 'produtos', 'venda', 'pedidos', 'pedidos-kanban', 'caixa', 'financeiro', 'relatorios']);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('role_permissions')
        .select('route')
        .eq('role', role);

      if (error) throw error;

      setPermissions(data.map(p => p.route));
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (route) => {
    if (role === 'admin') return true;
    return permissions.includes(route);
  };

  return { permissions, loading, hasPermission };
};
