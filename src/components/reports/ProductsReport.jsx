import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ProductsReport = ({ filters, pedidos, produtos }) => {
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
        valorTotal: 0
      });
    });

    // Process orders and accumulate sales data
    pedidos.forEach(pedido => {
      // Skip if order items is undefined or empty
      if (!pedido.items || pedido.items.length === 0) return;

      // Check date filter
      const orderDate = new Date(pedido.created_at);
      const startDate = filters.dataInicio ? new Date(filters.dataInicio) : new Date(0);
      const endDate = filters.dataFim ? new Date(filters.dataFim) : new Date();
      
      if (orderDate >= startDate && orderDate <= endDate) {
        pedido.items.forEach(item => {
          if (productSalesMap.has(item.product_id)) {
            const currentData = productSalesMap.get(item.product_id);
            productSalesMap.set(item.product_id, {
              ...currentData,
              quantidade: currentData.quantidade + (item.quantity || 0),
              valorTotal: currentData.valorTotal + ((item.quantity || 0) * (item.unit_price || 0))
            });
          }
        });
      }
    });

    // Convert map to array and filter out products with no sales
    return Array.from(productSalesMap.values())
      .filter(item => item.quantidade > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);
  };

  const relatorio = gerarRelatorioProdutos();

  if (relatorio.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Nenhum dado encontrado para o período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade Vendida</TableHead>
            <TableHead>Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatorio.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.produto}</TableCell>
              <TableCell>{item.quantidade}</TableCell>
              <TableCell>R$ {item.valorTotal.toFixed(2)}</TableCell>
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
          <Bar dataKey="valorTotal" fill="#82ca9d" name="Valor Total" />
        </BarChart>
      </div>
    </div>
  );
};

export default ProductsReport;