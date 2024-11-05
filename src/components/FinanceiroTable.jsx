import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

const FinanceiroTable = ({ pedidosFiltrados, setPedidoSelecionado }) => {
  return (
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
              <Button onClick={() => setPedidoSelecionado(pedido)}>Pagar</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FinanceiroTable;