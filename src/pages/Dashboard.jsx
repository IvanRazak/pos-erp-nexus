import React from 'react';
import { Outlet } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  );
};

export default Dashboard;