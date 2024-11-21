import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell>
                <Button onClick={() => abrirModalDetalhes(pedido)}>Detalhes</Button>
                <Button onClick={() => atualizarStatus(pedido.id, pedido.status === 'cancelled' ? 'active' : 'cancelled')}>
                  {pedido.status === 'cancelled' ? 'Reativar' : 'Cancelar'}
                </Button>
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
