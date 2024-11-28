import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import PagamentoDialog from './PagamentoDialog';
import FinanceiroFiltros from './FinanceiroFiltros';

const FinanceiroTable = ({ 
  pedidos,
  filters,
  setFilters,
  opcoesPagamento,
  handlePagamento,
  setPedidoSelecionado,
  valorPagamento,
  setValorPagamento,
  opcaoPagamento,
  setOpcaoPagamento,
  pedidoSelecionado
}) => {
  return (
    <div>
      <FinanceiroFiltros filters={filters} setFilters={setFilters} />
      
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
          {pedidos.map((pedido) => (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinanceiroTable;