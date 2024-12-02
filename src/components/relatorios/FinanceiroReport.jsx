import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const FinanceiroReport = ({ filteredPedidos, paymentOptions }) => {
  const gerarRelatorioFinanceiro = () => {
    if (!filteredPedidos) return { totalVendas: 0, totalPago: 0, totalPendente: 0, porFormaPagamento: [] };
    
    const totalVendas = filteredPedidos.reduce((sum, pedido) => sum + pedido.total_amount, 0);
    const totalPago = filteredPedidos.reduce((sum, pedido) => sum + pedido.paid_amount, 0);
    const totalPendente = filteredPedidos.reduce((sum, pedido) => sum + pedido.remaining_balance, 0);

    const porFormaPagamento = paymentOptions?.map(option => ({
      formaPagamento: option.name,
      valor: filteredPedidos
        .filter(pedido => pedido.payment_option === option.name)
        .reduce((sum, pedido) => sum + pedido.paid_amount, 0)
    })) || [];

    return {
      totalVendas,
      totalPago,
      totalPendente,
      porFormaPagamento
    };
  };

  const relatorio = gerarRelatorioFinanceiro();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold">Total de Vendas</h3>
          <p className="text-2xl">R$ {relatorio.totalVendas.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold">Total Pago</h3>
          <p className="text-2xl">R$ {relatorio.totalPago.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          <h3 className="font-semibold">Total Pendente</h3>
          <p className="text-2xl">R$ {relatorio.totalPendente.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Por Forma de Pagamento</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead>Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relatorio.porFormaPagamento.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.formaPagamento}</TableCell>
                <TableCell>R$ {item.valor.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <BarChart width={800} height={300} data={relatorio.porFormaPagamento}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formaPagamento" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="valor" fill="#82ca9d" name="Valor Total" />
        </BarChart>
      </div>
    </div>
  );
};

export default FinanceiroReport;