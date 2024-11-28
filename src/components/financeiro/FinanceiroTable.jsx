import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import PageSizeSelector from '../ui/page-size-selector';

const ORDER_STATUS_OPTIONS = [
  'in_production',
  'pending',
  'paid',
  'partial_payment',
  'waiting_approval',
  'ready_for_pickup',
  'delivered',
  'cancelled'
];

const FinanceiroTable = ({ 
  pedidosFiltrados,
  opcoesPagamento,
  handlePagamento,
  setPedidoSelecionado,
  valorPagamento,
  setValorPagamento,
  opcaoPagamento,
  setOpcaoPagamento,
  selectedStatus,
  setSelectedStatus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const formatStatus = (status) => {
    const statusMap = {
      'in_production': 'Em Produção',
      'pending': 'Pendente',
      'paid': 'Pago',
      'partial_payment': 'Pagamento Parcial',
      'waiting_approval': 'Aguardando Aprovação',
      'ready_for_pickup': 'Pronto para Retirada',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div>
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
          {currentItems.map((pedido) => (
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
                      <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status do Pedido" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatStatus(status)}
                            </SelectItem>
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

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, pedidosFiltrados.length)} de {pedidosFiltrados.length} registros
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

export default FinanceiroTable;