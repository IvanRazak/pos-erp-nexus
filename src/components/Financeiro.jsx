import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders, usePaymentOptions, useCustomers } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import FinanceiroFilters from './FinanceiroFilters';
import FinanceiroTable from './FinanceiroTable';
import ProcessarPagamentoModal from './ProcessarPagamentoModal';

const Financeiro = () => {
  const [filters, setFilters] = useState({
    dataInicio: null,
    dataFim: null,
    opcaoPagamento: '',
    cliente: '',
    numeroPedido: ''
  });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: pedidos, isLoading: isLoadingPedidos } = useOrders();
  const { data: opcoesPagamento, isLoading: isLoadingOpcoesPagamento } = usePaymentOptions();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const pedidosFiltrados = useMemo(() => {
    if (!pedidos) return [];
    return pedidos.filter(pedido => {
      const pedidoDate = parseISO(pedido.created_at);
      const matchData = (!filters.dataInicio || !filters.dataFim || isWithinInterval(pedidoDate, {
        start: startOfDay(filters.dataInicio),
        end: endOfDay(filters.dataFim)
      }));
      const matchOpcaoPagamento = !filters.opcaoPagamento || pedido.payment_option === filters.opcaoPagamento;
      const matchCliente = !filters.cliente || (pedido.customer?.name && pedido.customer.name.toLowerCase().includes(filters.cliente.toLowerCase()));
      const matchNumeroPedido = !filters.numeroPedido || pedido.order_number?.toString().includes(filters.numeroPedido);
      return matchData && matchOpcaoPagamento && matchCliente && matchNumeroPedido && pedido.status !== 'cancelled';
    });
  }, [pedidos, filters]);

  if (isLoadingPedidos || isLoadingOpcoesPagamento || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro - Saldos Restantes</h2>
      
      <FinanceiroFilters 
        filters={filters}
        setFilters={setFilters}
        opcoesPagamento={opcoesPagamento}
      />

      <FinanceiroTable
        pedidosFiltrados={pedidosFiltrados}
        setPedidoSelecionado={setPedidoSelecionado}
      />

      {pedidoSelecionado && (
        <ProcessarPagamentoModal
          pedido={pedidoSelecionado}
          opcoesPagamento={opcoesPagamento}
          onClose={() => setPedidoSelecionado(null)}
        />
      )}
    </div>
  );
};

export default Financeiro;