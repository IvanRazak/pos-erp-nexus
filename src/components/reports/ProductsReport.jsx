import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

const formatQuantity = (value) => {
  return Number(value).toFixed(2);
};

const ProductsReport = ({ pedidos, produtos, filters }) => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const gerarRelatorioProdutos = () => {
    if (!pedidos || !produtos || pedidos.length === 0 || produtos.length === 0) {
      return [];
    }

    // Create a map to store product sales data
    const productSalesMap = new Map();

    // Initialize map with all products
    produtos.forEach(produto => {
      productSalesMap.set(produto.id, {
        produto: produto.name,
        quantidade: 0,
        valorTotal: 0,
        valorTotalComDesconto: 0,
        totalItensVendidos: 0
      });
    });

    // Filter and process orders
    const filteredOrders = pedidos.filter(pedido => {
      if (!pedido.items) return false;
      
      const matchData = (!filters.dataInicio || !filters.dataFim || isWithinInterval(
        parseISO(pedido.created_at),
        {
          start: startOfDay(filters.dataInicio),
          end: endOfDay(filters.dataFim)
        }
      ));

      const matchValor = (!filters.valorMinimo || pedido.total_amount >= parseFloat(filters.valorMinimo)) &&
                        (!filters.valorMaximo || pedido.total_amount <= parseFloat(filters.valorMaximo));
      
      const matchStatus = filters.status === 'all' || pedido.status === filters.status;
      const matchCreatedBy = filters.createdBy === 'all' || pedido.created_by === filters.createdBy;
      
      return matchData && matchValor && matchStatus && matchCreatedBy;
    });

    // Process filtered orders
    filteredOrders.forEach(pedido => {
      if (!pedido.items || pedido.items.length === 0) return;
      
      pedido.items.forEach(item => {
        if (productSalesMap.has(item.product_id)) {
          const currentData = productSalesMap.get(item.product_id);
          const quantidade = item.quantity || 0;
          const valorUnitario = item.unit_price || 0;
          const desconto = item.discount || 0;
          const valorTotalItem = quantidade * valorUnitario;
          const valorTotalComDesconto = valorTotalItem - desconto;

          productSalesMap.set(item.product_id, {
            ...currentData,
            quantidade: currentData.quantidade + quantidade,
            valorTotal: currentData.valorTotal + valorTotalItem,
            valorTotalComDesconto: currentData.valorTotalComDesconto + valorTotalComDesconto,
            totalItensVendidos: currentData.totalItensVendidos + quantidade
          });
        }
      });
    });

    // Convert map to array and calculate averages
    return Array.from(productSalesMap.values())
      .map(item => ({
        ...item,
        precoMedioUnitario: item.totalItensVendidos > 0 
          ? item.valorTotalComDesconto / item.totalItensVendidos 
          : 0
      }))
      .sort((a, b) => b.valorTotalComDesconto - a.valorTotalComDesconto);
  };

  if (!pedidos || !produtos) {
    return (
      <div className="text-center py-4">
        <p>Carregando dados...</p>
      </div>
    );
  }

  const relatorio = gerarRelatorioProdutos();
  const totalPages = Math.ceil(relatorio.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = relatorio.slice(startIndex, endIndex);

  if (relatorio.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Nenhum produto encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Relatório de Produtos</h2>
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
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Produtos</h3>
          <p className="text-2xl font-bold">{relatorio.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Itens Vendidos</h3>
          <p className="text-2xl font-bold">
            {formatQuantity(relatorio.reduce((sum, item) => sum + item.quantidade, 0))}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Vendas</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(relatorio.reduce((sum, item) => sum + item.valorTotalComDesconto, 0))}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Médio</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(relatorio.reduce((sum, item) => sum + item.valorTotalComDesconto, 0) / relatorio.reduce((sum, item) => sum + item.quantidade, 0))}
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
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Quantidade Vendida</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Valor Total com Desconto</TableHead>
            <TableHead className="text-right">Preço Médio Unitário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.produto}</TableCell>
              <TableCell className="text-right">{formatQuantity(item.quantidade)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.valorTotal)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.valorTotalComDesconto)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.precoMedioUnitario)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4">
        <BarChart width={800} height={300} data={relatorio}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="produto" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
          <Bar dataKey="valorTotalComDesconto" fill="#82ca9d" name="Valor Total com Desconto" />
        </BarChart>
      </div>
    </div>
  );
};

export default ProductsReport;
