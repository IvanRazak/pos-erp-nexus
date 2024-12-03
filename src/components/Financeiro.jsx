import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOrders, usePaymentOptions, useUpdateOrder, useAddPayment, useCustomers } from '../integrations/supabase';
import { useAddEventLog } from '../integrations/supabase/hooks/events_log';
import { useOrderStatusSettings } from '../integrations/supabase/hooks/order_status_settings';
import { toast } from "sonner";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { useAuth } from '../hooks/useAuth';
import FinanceiroTable from './financeiro/FinanceiroTable';
import FinanceiroFiltros from './financeiro/FinanceiroFiltros';
import PagamentoDialog from './financeiro/PagamentoDialog';

const Financeiro = () => {
  const [filters, setFilters] = useState({
    dataInicio: null,
    dataFim: null,
    opcaoPagamento: '',
    cliente: '',
    numeroPedido: '',
    mostrarPagos: false
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
  const { data: orderStatusSettings } = useOrderStatusSettings();
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
      const matchPago = filters.mostrarPagos || pedido.remaining_balance > 0;
      return matchData && matchOpcaoPagamento && matchCliente && matchNumeroPedido && matchPago && pedido.status !== 'cancelled';
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
      // Determina o status correto com base nas configurações
      let novoStatus = pedidoSelecionado.status; // Mantém o status atual por padrão
      
      if (novoSaldoRestante <= 0) {
        // Se o saldo foi totalmente pago, verifica as configurações
        const statusConfig = orderStatusSettings?.full_payment_status_financeiro;
        // Só muda o status se não for 'no_change'
        if (statusConfig && statusConfig !== 'no_change') {
          novoStatus = statusConfig;
        }
      } else {
        // Se ainda há saldo restante, verifica as configurações para pagamento parcial
        const statusConfig = orderStatusSettings?.partial_payment_status;
        // Só muda o status se não for 'no_change'
        if (statusConfig && statusConfig !== 'no_change') {
          novoStatus = statusConfig;
        }
      }

      await updateOrder.mutateAsync({
        id: pedidoSelecionado.id,
        paid_amount: novoPagamentoTotal,
        remaining_balance: novoSaldoRestante,
        status: novoStatus,
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
      
      <FinanceiroFiltros 
        filters={filters}
        setFilters={setFilters}
        opcoesPagamento={opcoesPagamento}
      />
      
      <FinanceiroTable
        pedidosFiltrados={pedidosFiltrados}
        renderPagamentoButton={(pedido) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setPedidoSelecionado(pedido)}>Pagar</Button>
            </DialogTrigger>
            <PagamentoDialog
              pedido={pedido}
              valorPagamento={valorPagamento}
              setValorPagamento={setValorPagamento}
              opcaoPagamento={opcaoPagamento}
              setOpcaoPagamento={setOpcaoPagamento}
              opcoesPagamento={opcoesPagamento}
              onConfirm={handlePagamento}
            />
          </Dialog>
        )}
      />
    </div>
  );
};

export default Financeiro;