import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const FinancialReport = ({ financialData }) => {
  const { totalVendas, totalPago, totalPendente, porFormaPagamento } = financialData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
        <Button 
          onClick={handlePrint}
          className="print:hidden"
          variant="outline"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 dark:bg-blue-800 rounded-lg shadow">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Total de Vendas</h3>
          <p className="text-2xl text-blue-900 dark:text-blue-100">{formatCurrency(totalVendas)}</p>
        </div>
        <div className="p-4 bg-green-100 dark:bg-green-800 rounded-lg shadow">
          <h3 className="font-semibold text-green-900 dark:text-green-100">Total Pago</h3>
          <p className="text-2xl text-green-900 dark:text-green-100">{formatCurrency(totalPago)}</p>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-800 rounded-lg shadow">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Total Pendente</h3>
          <p className="text-2xl text-red-900 dark:text-red-100">{formatCurrency(totalPendente)}</p>
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

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Por Forma de Pagamento</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {porFormaPagamento.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.formaPagamento}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.valor)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <BarChart width={800} height={300} data={porFormaPagamento}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formaPagamento" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="valor" fill="#82ca9d" name="Valor Total" />
        </BarChart>
      </div>
    </div>
  );
};

export default FinancialReport;
