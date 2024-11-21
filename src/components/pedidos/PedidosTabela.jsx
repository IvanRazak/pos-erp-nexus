import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

const PedidosTabela = ({ pedidos, clientes, atualizarStatus, abrirModalDetalhes, handleCancelarPedido, descontosIndividuais }) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidos.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>
                {format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </TableCell>
              <TableCell>
                R$ {pedido.total_amount?.toFixed(2)}
              </TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => abrirModalDetalhes(pedido)}
                >
                  Detalhes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => atualizarStatus(pedido.id, pedido.status === 'cancelled' ? 'active' : 'cancelled')}
                >
                  {pedido.status === 'cancelled' ? 'Reativar' : 'Cancelar'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PedidosTabela;