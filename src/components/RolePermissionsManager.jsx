import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

const RolePermissionsManager = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const routes = [
    { id: 'clientes', label: 'Clientes' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'venda', label: 'Venda' },
    { id: 'pedidos', label: 'Gerenciamento de Pedidos' },
    { id: 'pedidos-kanban', label: 'Pedidos Kanban' },
    { id: 'caixa', label: 'Caixa' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'relatorios', label: 'Relatórios' }
  ];

  const roles = [
    { id: 'admin', label: 'Administrador' },
    { id: 'gerente', label: 'Gerente' },
    { id: 'operator', label: 'Operador' },
    { id: 'seller', label: 'Vendedor' },
    { id: 'producao', label: 'Produção' }
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;

      // Transformar os dados em um formato mais fácil de trabalhar
      const permissionsMap = {};
      roles.forEach(role => {
        permissionsMap[role.id] = {};
        routes.forEach(route => {
          permissionsMap[role.id][route.id] = false;
        });
      });

      // Preencher com as permissões do banco de dados
      data.forEach(permission => {
        permissionsMap[permission.role][permission.route] = true;
      });

      setPermissions(permissionsMap);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões');
    }
  };

  const handlePermissionChange = async (role, route, checked) => {
    try {
      if (checked) {
        // Adicionar permissão
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, route });

        if (error) throw error;
      } else {
        // Remover permissão
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .match({ role, route });

        if (error) throw error;
      }

      // Atualizar estado local
      setPermissions(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [route]: checked
        }
      }));

      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Rota</th>
              {roles.map(role => (
                <th key={role.id} className="text-center p-2">{role.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id} className="border-t">
                <td className="p-2">{route.label}</td>
                {roles.map(role => (
                  <td key={role.id} className="text-center p-2">
                    <Checkbox
                      checked={permissions[role.id]?.[route.id] || false}
                      onCheckedChange={(checked) => handlePermissionChange(role.id, route.id, checked)}
                      disabled={role.id === 'admin'} // Admin sempre tem todas as permissões
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
};

export default RolePermissionsManager;
