import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { formatCurrency } from '../../utils/formatters';
import { traduzirStatus } from '../../utils/statusTraducao';

const OrdersReport = ({ filteredOrders, clientes }) => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const gerarRelatorioPedidos = () => {
    if (!filteredOrders || !clientes) return [];

    return filteredOrders.map(pedido => ({
      numeroPedido: pedido.order_number,
      cliente: clientes.find(c => c.id === pedido.customer_id)?.name || 'N/A',
      data: format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      valor: pedido.total_amount,
      status: traduzirStatus(pedido.status),
      formaPagamento: pedido.payment_option,
      criadoPor: pedido.created_by
    }));
  };

  const relatorio = gerarRelatorioPedidos();
  const totalPages = Math.ceil(relatorio.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = relatorio.slice(startIndex, endIndex);

  const handlePrint = () => {
    window.print();
  };

  if (!filteredOrders || !clientes) {
    return (
      <div className="text-center py-4">
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (relatorio.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Nenhum pedido encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Relatório de Pedidos</h2>
        <Button 
          onClick={handlePrint}
          className="print:hidden"
          variant="outline"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Pedidos</h3>
          <p className="text-2xl font-bold">{relatorio.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor Total</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(relatorio.reduce((sum, item) => sum + item.valor, 0))}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Médio</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(relatorio.reduce((sum, item) => sum + item.valor, 0) / relatorio.length)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Itens por página</span>
          <Select value={String(itemsPerPage)} onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>

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
          {currentItems.map((pedido, index) => (
            <TableRow key={index}>
              <TableCell>{pedido.numeroPedido}</TableCell>
              <TableCell>{pedido.cliente}</TableCell>
              <TableCell>{pedido.data}</TableCell>
              <TableCell>{formatCurrency(pedido.valor)}</TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell>{pedido.formaPagamento}</TableCell>
              <TableCell>{pedido.criadoPor}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersReport;
