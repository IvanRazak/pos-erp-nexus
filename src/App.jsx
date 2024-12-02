import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { SupabaseAuthProvider } from "./integrations/supabase";
import AdminMenu from "./components/AdminMenu";
import Clientes from "./components/Clientes";
import Produtos from "./components/Produtos";
import Venda from "./components/Venda";
import GerenciamentoPedidos from "./components/GerenciamentoPedidos";
import PedidosKanban from "./pages/PedidosKanban";
import Financeiro from "./components/Financeiro";
import Relatorios from "./components/Relatorios";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen">
              <AdminMenu />
              <div className="p-4">
                <Routes>
                  <Route path="/" element={<Venda />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/pedidos" element={<GerenciamentoPedidos />} />
                  <Route path="/pedidos-kanban" element={<PedidosKanban />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </div>
            </div>
          </Router>
          <Toaster />
        </ThemeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;