import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders, useCustomers, useUpdateOrder } from '../integrations/supabase';
import { useOrderDiscounts } from '../integrations/supabase/hooks/order_discounts';
import { toast } from "sonner";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { useAuth } from '../hooks/useAuth';
import PedidoDetalhesModal from './PedidoDetalhesModal';
import PedidosFiltros from './pedidos/PedidosFiltros';
import PedidosTabela from './pedidos/PedidosTabela';

const GerenciamentoPedidos = () => {
  const [filters, setFilters] = useState({
    cliente: '',
    numeroPedido: '',
    dataInicio: null,
    dataFim: null,
    valorMinimo: '',
    valorMaximo: '',
    status: 'all'
  });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: pedidos, isLoading: isLoadingPedidos } = useOrders();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();
  const updateOrder = useUpdateOrder();

  const { data: descontosIndividuais = {} } = useOrderDiscounts(
    pedidos?.map(pedido => pedido.id) || []
  );

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
      const matchCliente = !filters.cliente || (pedido.customer?.name && pedido.customer.name.toLowerCase().includes(filters.cliente.toLowerCase()));
      const matchNumeroPedido = !filters.numeroPedido || pedido.order_number?.toString().includes(filters.numeroPedido);
      const matchValor = (!filters.valorMinimo || pedido.total_amount >= parseFloat(filters.valorMinimo)) &&
                        (!filters.valorMaximo || pedido.total_amount <= parseFloat(filters.valorMaximo));
      const matchStatus = filters.status === 'all' || pedido.status === filters.status;
      return matchData && matchCliente && matchNumeroPedido && matchValor && matchStatus;
    });
  }, [pedidos, filters]);

  const handleCancelarPedido = (pedidoId) => {
    updateOrder.mutate(
      { 
        id: pedidoId, 
        status: 'cancelled'
      },
      {
        onSuccess: () => {
          toast.success("Pedido cancelado com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao cancelar pedido: " + error.message);
        }
      }
    );
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    updateOrder.mutate(
      { id: pedidoId, status: novoStatus },
      {
        onSuccess: () => {
          toast.success("Status do pedido atualizado com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao atualizar status do pedido: " + error.message);
        }
      }
    );
  };

  if (isLoadingPedidos || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h2>
      <PedidosFiltros filters={filters} setFilters={setFilters} />
      <PedidosTabela 
        pedidos={pedidosFiltrados}
        clientes={clientes}
        atualizarStatus={atualizarStatus}
        abrirModalDetalhes={setPedidoSelecionado}
        handleCancelarPedido={handleCancelarPedido}
        descontosIndividuais={descontosIndividuais}
      />
      {pedidoSelecionado && (
        <PedidoDetalhesModal pedido={pedidoSelecionado} onClose={() => setPedidoSelecionado(null)} />
      )}
    </div>
  );
};

export default GerenciamentoPedidos;