import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

const OrdersReport = ({ filteredOrders, clientes }) => {
  const gerarRelatorioPedidos = () => {
    if (!filteredOrders || !clientes) return [];

    return filteredOrders.map(pedido => ({
      numeroPedido: pedido.order_number,
      cliente: clientes.find(c => c.id === pedido.customer_id)?.name || 'N/A',
      data: format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      valor: pedido.total_amount,
      status: pedido.status,
      formaPagamento: pedido.payment_option,
      criadoPor: pedido.created_by
    }));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número do Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Forma de Pagamento</TableHead>
          <TableHead>Criado Por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gerarRelatorioPedidos().map((pedido, index) => (
          <TableRow key={index}>
            <TableCell>{pedido.numeroPedido}</TableCell>
            <TableCell>{pedido.cliente}</TableCell>
            <TableCell>{pedido.data}</TableCell>
            <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
            <TableCell>{pedido.status}</TableCell>
            <TableCell>{pedido.formaPagamento}</TableCell>
            <TableCell>{pedido.criadoPor}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersReport;