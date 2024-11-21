import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import PageSizeSelector from '../ui/page-size-selector';

const PedidosTabela = ({ pedidos, clientes, atualizarStatus, abrirModalDetalhes, handleCancelarPedido, descontosIndividuais }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Data e Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Pago</TableHead>
            <TableHead>Saldo Restante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>
                {pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
              </TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>R$ {pedido.paid_amount?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>R$ {pedido.remaining_balance?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                <Select defaultValue={pedido.status} onValueChange={(value) => atualizarStatus(pedido.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atualizar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_production">Em Produção</SelectItem>
                    <SelectItem value="awaiting_approval">Aguardando Aprovação</SelectItem>
                    <SelectItem value="ready_for_pickup">Pronto para Retirada</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button onClick={() => abrirModalDetalhes(pedido)}>
                    Ver Detalhes
                  </Button>
                  {pedido.status !== 'cancelled' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Cancelar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Não</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelarPedido(pedido.id)}>
                            Sim, cancelar pedido
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, pedidos.length)} de {pedidos.length} registros
          </div>
          <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PedidosTabela;