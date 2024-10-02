import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseAuthProvider } from './integrations/supabase/auth';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./components/Clientes";
import Produtos from "./components/Produtos";
import Venda from "./components/Venda";
import GerenciamentoPedidos from "./components/GerenciamentoPedidos";
import Caixa from "./components/Caixa";
import Financeiro from "./components/Financeiro";
import Relatorios from "./components/Relatorios";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />}>
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="produtos" element={<Produtos />} />
                  <Route path="venda" element={<Venda />} />
                  <Route path="pedidos" element={<GerenciamentoPedidos />} />
                  <Route path="caixa" element={<Caixa />} />
                  <Route path="financeiro" element={<Financeiro />} />
                  <Route path="relatorios" element={<Relatorios />} />
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;