import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const ProductsReport = ({ filters, pedidos, produtos }) => {
  const gerarRelatorioProdutos = () => {
    if (!pedidos || !produtos) return [];
    
    const produtosVendidos = pedidos.flatMap(pedido => 
      pedido.items?.map(item => ({
        ...item,
        data: pedido.created_at,
        status: pedido.status
      })) || []
    );

    return produtos.map(produto => {
      const vendasProduto = produtosVendidos.filter(item => {
        const matchData = (!filters.dataInicio || !filters.dataFim || 
          isWithinInterval(parseISO(item.data), {
            start: filters.dataInicio ? startOfDay(filters.dataInicio) : startOfDay(new Date(0)),
            end: filters.dataFim ? endOfDay(filters.dataFim) : endOfDay(new Date())
          }));
        
        return item.product_id === produto.id && matchData;
      });

      const quantidade = vendasProduto.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const valorTotal = vendasProduto.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);

      return {
        produto: produto.name,
        quantidade,
        valorTotal
      };
    }).filter(item => item.quantidade > 0);
  };

  const relatorio = gerarRelatorioProdutos();

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

      {relatorio.length > 0 && (
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
      )}
    </div>
  );
};

export default ProductsReport;