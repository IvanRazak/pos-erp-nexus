import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminMenu from '../components/AdminMenu';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const defaultTabs = [
    { value: "clientes", label: "Clientes" },
    { value: "produtos", label: "Produtos" },
    { value: "venda", label: "Venda" },
    { value: "pedidos", label: "Gerenciamento de Pedidos" },
    { value: "caixa", label: "Caixa" },
    { value: "financeiro", label: "Financeiro" },
    { value: "relatorios", label: "Relatórios" }
  ];

  let tabs = [];

  if (user) {
    switch (user.role) {
      case 'operator':
        tabs = defaultTabs.filter(tab => 
          tab.value !== 'relatorios'
        );
        break;
      case 'producao':
        tabs = [{ value: "pedidos", label: "Gerenciamento de Pedidos" }];
        break;
      case 'seller':
        tabs = defaultTabs.filter(tab => 
          tab.value !== 'relatorios' && tab.value !== 'caixa'  && tab.value !== 'financeiro'
        );
        break;
      case 'admin':
        tabs = defaultTabs;
        break;
      default:
        tabs = [];
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
        <div className="flex items-center gap-4">
          {user && <span className="mr-4">Olá, {user.username}</span>}
          <ThemeToggle />
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      
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

      {user && user.isAdmin && <AdminMenu />}
    </div>
  );
};

export default Dashboard;