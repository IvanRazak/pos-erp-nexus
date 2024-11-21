import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

const PedidosTabela = ({ pedidos, clientes, atualizarStatus, abrirModalDetalhes, handleCancelarPedido, descontosIndividuais }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'in_production': 'Em Produção',
      'ready_for_pickup': 'Pronto para Retirada',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'awaiting_approval': 'Aguardando Aprovação',
      'partial_payment': 'Pagamento Parcial',
      'paid': 'Pago'
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Itens por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
            <SelectItem value="100">100 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((pedido) => (
            <TableRow key={pedido.id} className={pedido.status === 'cancelled' ? 'opacity-60' : ''}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>
                {pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
              </TableCell>
              <TableCell>{clientes?.find(c => c.id === pedido.customer_id)?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>{getStatusLabel(pedido.status)}</TableCell>
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
        <div className="text-sm text-gray-500">
          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, pedidos.length)} de {pedidos.length} registros
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