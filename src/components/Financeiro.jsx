import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOrders, usePaymentOptions, useUpdateOrder, useAddPayment } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const Financeiro = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [valorPagamento, setValorPagamento] = useState(0);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');

  const queryClient = useQueryClient();
  const { data: pedidos, isLoading: isLoadingPedidos } = useOrders();
  const { data: opcoesPagamento, isLoading: isLoadingOpcoesPagamento } = usePaymentOptions();
  const updateOrder = useUpdateOrder();
  const addPayment = useAddPayment();

  const filtrarPedidos = () => {
    if (!pedidos) return [];
    return pedidos.filter(pedido => {
      const matchData = (!filtroDataInicio || new Date(pedido.created_at) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(pedido.created_at) <= filtroDataFim);
      const matchOpcaoPagamento = !filtroOpcaoPagamento || pedido.payment_option === filtroOpcaoPagamento;
      return matchData && matchOpcaoPagamento && pedido.remaining_balance > 0;
    });
  };

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

  if (isLoadingPedidos || isLoadingOpcoesPagamento) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro - Saldos Restantes</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <DatePicker
          selected={filtroDataInicio}
          onChange={setFiltroDataInicio}
          placeholderText="Data Início"
        />
        <DatePicker
          selected={filtroDataFim}
          onChange={setFiltroDataFim}
          placeholderText="Data Fim"
        />
        
        <Select onValueChange={setFiltroOpcaoPagamento} value={filtroOpcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {opcoesPagamento?.map((option) => (
              <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
          {filtrarPedidos().map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number || 'N/A'}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.paid_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.remaining_balance.toFixed(2)}</TableCell>
              <TableCell>{new Date(pedido.created_at).toLocaleDateString()}</TableCell>
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
    </div>
  );
};

export default Financeiro;
