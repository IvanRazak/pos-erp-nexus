import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseAuthProvider } from './integrations/supabase/auth';
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./components/Clientes";
import Produtos from "./components/Produtos";
import Venda from "./components/Venda";
import GerenciamentoPedidos from "./components/GerenciamentoPedidos";
import Caixa from "./components/Caixa";
import Financeiro from "./components/Financeiro";
import Relatorios from "./components/Relatorios";
import PedidosKanban from "./pages/PedidosKanban";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" attribute="class">
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                  <Route path="clientes" element={
                    <ProtectedRoute route="clientes">
                      <Clientes />
                    </ProtectedRoute>
                  } />
                  <Route path="produtos" element={
                    <ProtectedRoute route="produtos">
                      <Produtos />
                    </ProtectedRoute>
                  } />
                  <Route path="venda" element={
                    <ProtectedRoute route="venda">
                      <Venda />
                    </ProtectedRoute>
                  } />
                  <Route path="pedidos" element={
                    <ProtectedRoute route="pedidos">
                      <GerenciamentoPedidos />
                    </ProtectedRoute>
                  } />
                  <Route path="pedidos-kanban" element={
                    <ProtectedRoute route="pedidos-kanban">
                      <PedidosKanban />
                    </ProtectedRoute>
                  } />
                  <Route path="caixa" element={
                    <ProtectedRoute route="caixa">
                      <Caixa />
                    </ProtectedRoute>
                  } />
                  <Route path="financeiro" element={
                    <ProtectedRoute route="financeiro">
                      <Financeiro />
                    </ProtectedRoute>
                  } />
                  <Route path="relatorios" element={
                    <ProtectedRoute route="relatorios">
                      <Relatorios />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

export default App;
