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
import PageSizeSelector from './ui/page-size-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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

  const paginatedPedidos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return pedidosFiltrados.slice(startIndex, endIndex);
  }, [pedidosFiltrados, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);

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

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  if (isLoadingPedidos || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h2>
      <PedidosFiltros filters={filters} setFilters={setFilters} />
      <PedidosTabela 
        pedidos={paginatedPedidos}
        clientes={clientes}
        atualizarStatus={atualizarStatus}
        abrirModalDetalhes={setPedidoSelecionado}
        handleCancelarPedido={handleCancelarPedido}
        descontosIndividuais={descontosIndividuais}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, pedidosFiltrados.length)} de {pedidosFiltrados.length} registros
          </div>
          <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Página:</span>
          <Select 
            value={currentPage.toString()} 
            onValueChange={(value) => setCurrentPage(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Página" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {pedidoSelecionado && (
        <PedidoDetalhesModal pedido={pedidoSelecionado} onClose={() => setPedidoSelecionado(null)} />
      )}
    </div>
  );
};

export default GerenciamentoPedidos;