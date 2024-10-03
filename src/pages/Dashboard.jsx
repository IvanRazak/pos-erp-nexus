import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminMenu from '../components/AdminMenu';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button"

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const tabs = [
    { value: "clientes", label: "Clientes" },
    { value: "produtos", label: "Produtos" },
    { value: "venda", label: "Venda" },
    { value: "pedidos", label: "Gerenciamento de Pedidos" },
  ];

  // Adiciona as abas Caixa, Relatórios e Financeiro apenas se o usuário não for um operador
  if (user && user.role !== 'operator') {
    tabs.push(
      { value: "caixa", label: "Caixa" },
      { value: "relatorios", label: "Relatórios" },
      { value: "financeiro", label: "Financeiro" }
    );
  }

  // Se o usuário for do tipo 'producao', garante que a aba "clientes" está visível
if (user && user.role === 'producao') {
  tabs.push({ value: "pedidos", label: "Gerenciamento de Pedidos" });
}

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div id='uzu' className="flex items-center">
          {user && <span className="mr-4">Olá, {user.username}</span>}
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <div className="flex">
        <div className="w-3/4 pr-4">
          <Tabs defaultValue="clientes" className="w-full">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={() => navigate(`/dashboard/${tab.value}`)}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="mt-4">
            <Outlet />
          </div>
        </div>
        {user && user.isAdmin && (
          <div className="w-1/4">
            <AdminMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
