import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOrders, usePaymentOptions, useUpdateOrder, useAddPayment, useCustomers } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import AdminMenu from '../components/AdminMenu';

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
      return matchData && matchOpcaoPagamento && matchCliente && matchNumeroPedido && pedido.remaining_balance > 0;
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

    try {
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

      toast({
        title: "Pagamento processado com sucesso!",
        description: `Novo saldo restante: R$ ${novoSaldoRestante.toFixed(2)}`,
      });

      setPedidoSelecionado(null);
      setValorPagamento(0);
      setOpcaoPagamento('');
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['payments']);
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoadingPedidos || isLoadingOpcoesPagamento || isLoadingClientes) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro - Saldos Restantes</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <DatePicker
          selected={filters.dataInicio}
          onChange={(date) => setFilters({...filters, dataInicio: date})}
          placeholderText="Data Início"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <DatePicker
          selected={filters.dataFim}
          onChange={(date) => setFilters({...filters, dataFim: date})}
          placeholderText="Data Fim"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <Select onValueChange={(value) => setFilters({...filters, opcaoPagamento: value})} value={filters.opcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {opcoesPagamento?.map((option) => (
              <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filtrar por nome do cliente"
          value={filters.cliente}
          onChange={(e) => setFilters({...filters, cliente: e.target.value})}
        />
        <Input
          placeholder="Filtrar por número do pedido"
          value={filters.numeroPedido}
          onChange={(e) => setFilters({...filters, numeroPedido: e.target.value})}
        />
      </div>
      {user && user.isAdmin && (
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setPedidoSelecionado(pedido)}>Pagar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pagamento do Saldo Restante</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Saldo Restante: R$ {pedido.remaining_balance.toFixed(2)}</p>
                      <Input
                        type="number"
                        placeholder="Valor do Pagamento"
                        value={valorPagamento}
                        onChange={(e) => setValorPagamento(parseFloat(e.target.value))}
                      />
                      <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
                        <SelectTrigger>
                          <SelectValue placeholder="Opção de Pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcoesPagamento?.map((opcao) => (
                            <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handlePagamento}>Confirmar Pagamento</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </div>
  );
  );

export default Financeiro;
