import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const ProductsReport = ({ pedidos, produtos }) => {
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
        totalItensVendidos: 0 // Para calcular a média do preço unitário
      });
    });

    // Process all orders
    pedidos.forEach(pedido => {
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

  const relatorio = gerarRelatorioProdutos();

  if (relatorio.length === 0) {
    return (
      <div className="text-center py-4">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          {relatorio.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.produto}</TableCell>
              <TableCell className="text-right">{item.quantidade}</TableCell>
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