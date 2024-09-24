import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminMenu from '../components/AdminMenu';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.isAdmin;

  const tabs = [
    { value: "clientes", label: "Clientes" },
    { value: "produtos", label: "Produtos" },
    { value: "venda", label: "Venda" },
    { value: "pedidos", label: "Gerenciamento de Pedidos" },
    { value: "caixa", label: "Caixa" },
    { value: "financeiro", label: "Financeiro" },
    { value: "relatorios", label: "Relatórios" },
  ];

  return (
    <div className="container mx-auto p-4">
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
        {isAdmin && (
          <div className="w-1/4">
            <AdminMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
