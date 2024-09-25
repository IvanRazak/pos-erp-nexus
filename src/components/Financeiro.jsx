import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { useOrders, useUpdateOrder } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const Financeiro = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');

  const { data: pedidos, isLoading } = useOrders();
  const updateOrder = useUpdateOrder();

  const filtrarPedidos = () => {
    if (!pedidos) return [];
    return pedidos.filter(pedido => {
      const matchData = (!filtroDataInicio || new Date(pedido.created_at) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(pedido.created_at) <= filtroDataFim);
      const matchOpcaoPagamento = !filtroOpcaoPagamento || pedido.payment_option === filtroOpcaoPagamento;
      return matchData && matchOpcaoPagamento && pedido.remaining_balance > 0;
    });
  };

  const registrarPagamento = async (pedido, valorPago) => {
    const novoValorPago = pedido.paid_amount + valorPago;
    const novoSaldoRestante = pedido.total_amount - novoValorPago;
    const novoStatus = novoSaldoRestante <= 0 ? 'paid' : 'partial_payment';

    try {
      await updateOrder.mutateAsync({
        id: pedido.id,
        paid_amount: novoValorPago,
        remaining_balance: novoSaldoRestante,
        status: novoStatus,
      });
      toast({
        title: "Pagamento registrado com sucesso!",
        description: `Novo saldo restante: R$ ${novoSaldoRestante.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Contas a Receber</h2>
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
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
            <SelectItem value="debit_card">Cartão de Débito</SelectItem>
            <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
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
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Opção de Pagamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarPedidos().map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.id}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.paid_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.remaining_balance.toFixed(2)}</TableCell>
              <TableCell>{pedido.delivery_date}</TableCell>
              <TableCell>{pedido.payment_option}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Valor a pagar"
                  className="w-24 mr-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const valorPago = parseFloat(e.target.value);
                      if (valorPago > 0) {
                        registrarPagamento(pedido, valorPago);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <Button onClick={() => {
                  const input = e.target.previousSibling;
                  const valorPago = parseFloat(input.value);
                  if (valorPago > 0) {
                    registrarPagamento(pedido, valorPago);
                    input.value = '';
                  }
                }}>
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
