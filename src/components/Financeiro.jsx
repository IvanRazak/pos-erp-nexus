import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders, usePaymentOptions, useUpdateOrder, useAddPayment, useCustomers } from '../integrations/supabase';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import FinanceiroHeader from './FinanceiroHeader';
import PagamentoDialog from './PagamentoDialog';

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
  const updateOrder = useUpdateOrder();
  const addPayment = useAddPayment();

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
      toast({
        title: "Erro ao processar pagamento",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    const novoSaldoRestante = pedidoSelecionado.remaining_balance - valorPagamento;
    const novoPagamentoTotal = pedidoSelecionado.paid_amount + valorPagamento;

    await updateOrder.mutateAsync({
      id: pedidoSelecionado.id,
      paid_amount: novoPagamentoTotal,
      remaining_balance: novoSaldoRestante,
      status: novoSaldoRestante <= 0 ? 'paid' : 'partial_payment',
    });

    await addPayment.mutateAsync({
      order_id: pedidoSelecionado.id,
      amount: valorPagamento,
      payment_option: opcaoPagamento,
    });

    setPedidoSelecionado(null);
    setValorPagamento(0);
    setOpcaoPagamento('');
    queryClient.invalidateQueries(['orders']);
    queryClient.invalidateQueries(['payments']);
  };

  if (isLoadingPedidos || isLoadingOpcoesPagamento || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro - Saldos Restantes</h2>
      
      <FinanceiroHeader 
        filters={filters}
        setFilters={setFilters}
        opcoesPagamento={opcoesPagamento}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Pago</TableHead>
            <TableHead>Saldo Restante</TableHead>
            <TableHead>Data do Pedido</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidosFiltrados.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.paid_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.remaining_balance.toFixed(2)}</TableCell>
              <TableCell>{format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
              <TableCell>
                <PagamentoDialog
                  pedido={pedido}
                  valorPagamento={valorPagamento}
                  setValorPagamento={setValorPagamento}
                  opcaoPagamento={opcaoPagamento}
                  setOpcaoPagamento={setOpcaoPagamento}
                  opcoesPagamento={opcoesPagamento}
                  handlePagamento={handlePagamento}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Financeiro;