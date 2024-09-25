import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { useOrders, usePaymentOptions, useAddPayment } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const Financeiro = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');

  const { data: orders, isLoading: isLoadingOrders } = useOrders();
  const { data: paymentOptions, isLoading: isLoadingPaymentOptions } = usePaymentOptions();
  const addPayment = useAddPayment();

  const filtrarOrdens = () => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchData = (!filtroDataInicio || new Date(order.created_at) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(order.created_at) <= filtroDataFim);
      const matchOpcaoPagamento = !filtroOpcaoPagamento || order.payment_option === filtroOpcaoPagamento;
      return matchData && matchOpcaoPagamento && order.remaining_balance > 0;
    });
  };

  const handlePayment = async (orderId, remainingBalance) => {
    try {
      await addPayment.mutateAsync({
        order_id: orderId,
        amount: remainingBalance,
        payment_option: 'Pagamento do saldo restante',
      });
      toast({
        title: "Pagamento registrado com sucesso!",
        description: `Saldo de R$ ${remainingBalance.toFixed(2)} quitado.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoadingOrders || isLoadingPaymentOptions) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Financeiro</h2>
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
          <SelectItem value="all">Todas</SelectItem>
          {paymentOptions?.map((option) => (
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
            <TableHead>Opção de Pagamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarOrdens().map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>R$ {order.total_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {order.paid_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {order.remaining_balance.toFixed(2)}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{order.payment_option}</TableCell>
              <TableCell>
                <Button onClick={() => handlePayment(order.id, order.remaining_balance)}>
                  Registrar Pagamento
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Financeiro;
