import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders, usePaymentOptions, useUpdateOrder, useAddPayment, useCustomers, useOrderStatusSettings } from '../integrations/supabase';
import { useAddEventLog } from '../integrations/supabase/hooks/events_log';
import { toast } from "sonner";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import FinanceiroFiltros from './financeiro/FinanceiroFiltros';
import FinanceiroTable from './financeiro/FinanceiroTable';

const Financeiro = () => {
  const [filters, setFilters] = useState({
    dataInicio: null,
    dataFim: null,
    opcaoPagamento: '',
    cliente: '',
    numeroPedido: ''
  });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [valorPagamento, setValorPagamento] = useState(0);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { data: pedidos, isLoading: isLoadingPedidos } = useOrders();
  const { data: opcoesPagamento, isLoading: isLoadingOpcoesPagamento } = usePaymentOptions();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();
  const { data: statusSettings } = useOrderStatusSettings();
  const updateOrder = useUpdateOrder();
  const addPayment = useAddPayment();
  const addEventLog = useAddEventLog();

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

  const handlePagamento = async () => {
    if (!pedidoSelecionado || valorPagamento <= 0 || !opcaoPagamento) {
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    const novoSaldoRestante = pedidoSelecionado.remaining_balance - valorPagamento;
    const novoPagamentoTotal = pedidoSelecionado.paid_amount + valorPagamento;

    try {
      await updateOrder.mutateAsync({
        id: pedidoSelecionado.id,
        paid_amount: novoPagamentoTotal,
        remaining_balance: novoSaldoRestante,
        status: novoSaldoRestante <= 0 ? statusSettings?.full_payment_status_financeiro || 'paid' : 'partial_payment',
      });

      await addPayment.mutateAsync({
        order_id: pedidoSelecionado.id,
        amount: valorPagamento,
        payment_option: opcaoPagamento,
      });

      await addEventLog.mutateAsync({
        user_name: user.username,
        description: `Confirmou pagamento de R$ ${valorPagamento.toFixed(2)} via ${opcaoPagamento} para o pedido ${pedidoSelecionado.order_number}`,
      });

      toast.success(`Pagamento processado com sucesso! Novo saldo restante: R$ ${novoSaldoRestante.toFixed(2)}`);

      setPedidoSelecionado(null);
      setValorPagamento(0);
      setOpcaoPagamento('');
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['payments']);
    } catch (error) {
      toast.error("Erro ao processar pagamento: " + error.message);
    }
  };

  if (isLoadingPedidos || isLoadingOpcoesPagamento || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro - Saldos Restantes</h2>
      <FinanceiroFiltros filters={filters} setFilters={setFilters} opcoesPagamento={opcoesPagamento} />
      <FinanceiroTable 
        pedidosFiltrados={pedidosFiltrados}
        opcoesPagamento={opcoesPagamento}
        handlePagamento={handlePagamento}
        setPedidoSelecionado={setPedidoSelecionado}
        valorPagamento={valorPagamento}
        setValorPagamento={setValorPagamento}
        opcaoPagamento={opcaoPagamento}
        setOpcaoPagamento={setOpcaoPagamento}
      />
    </div>
  );
};

export default Financeiro;