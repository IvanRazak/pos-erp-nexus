import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminMenu from '../components/AdminMenu';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Definição das abas padrão
  const defaultTabs = [
    { value: "clientes", label: "Clientes" },
    { value: "produtos", label: "Produtos" },
    { value: "venda", label: "Venda" },
    { value: "pedidos", label: "Gerenciamento de Pedidos" },
    { value: "relatorios", label: "Relatórios" }
  ];

  // Inicializa o array de abas com base no papel do usuário
  let tabs = [];

  if (user) {
    switch (user.role) {
      case 'operator':
        tabs = defaultTabs.filter(tab => 
          tab.value !== 'relatorios' // Apenas "Clientes", "Produtos", "Venda", "Pedidos" e "Relatórios"
        );
        break;
      case 'producao':
        tabs = [{ value: "pedidos", label: "Gerenciamento de Pedidos" }]; // Apenas "Pedidos"
        break;
      case 'seller':
        tabs = defaultTabs.filter(tab => 
          tab.value !== 'relatorios' // "Clientes", "Produtos", "Venda" e "Pedidos"
        );
        break;
      case 'admin':
        tabs = defaultTabs; // Todas as abas
        break;
      default:
        tabs = []; // Nenhuma aba para outros papéis
    }
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
