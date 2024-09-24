import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePaymentOptions, useTransactions } from '../integrations/supabase';

const Caixa = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);

  const { data: paymentOptions, isLoading: isLoadingPaymentOptions } = usePaymentOptions();
  const { data: transacoes, isLoading: isLoadingTransactions } = useTransactions();

  const filtrarTransacoes = () => {
    if (!transacoes) return [];
    return transacoes.filter(transacao => {
      const matchData = (!filtroDataInicio || new Date(transacao.dataPagamento) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(transacao.dataPagamento) <= filtroDataFim);
      const matchOpcaoPagamento = !filtroOpcaoPagamento || transacao.opcaoPagamento === filtroOpcaoPagamento;
      return matchData && matchOpcaoPagamento;
    });
  };

  const gerarRelatorio = () => {
    const transacoesFiltradas = filtrarTransacoes();
    const totalVendas = transacoesFiltradas.reduce((acc, transacao) => acc + transacao.valor, 0);
    const saldoInicial = 1000; // Exemplo de saldo inicial
    const saldoFinal = saldoInicial + totalVendas;

    return {
      saldoInicial,
      totalVendas,
      totalPagamentos: totalVendas,
      saldoFinal,
    };
  };

  if (isLoadingTransactions || isLoadingPaymentOptions) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Controle de Caixa</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <DatePicker
          selected={filtroDataInicio}
          onChange={setFiltroDataInicio}
          placeholderText="Data Início"
        />
        <DatePicker
          selected={filtroDataFim}
          onChange={setFiltroDataFim}
          placeholderText="Data Fim"
        />
        
        <Select onValueChange={setFiltroOpcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {paymentOptions?.map((option) => (
              <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Opção de Pagamento</TableHead>
            <TableHead>Data do Pagamento</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarTransacoes().map((transacao) => (
            <TableRow key={transacao.id}>
              <TableCell>{transacao.numeroPedido}</TableCell>
              <TableCell>{transacao.cliente}</TableCell>
              <TableCell>{transacao.opcaoPagamento}</TableCell>
              <TableCell>{transacao.dataPagamento}</TableCell>
              <TableCell>
                <Input
                  defaultValue={transacao.descricao}
                  onChange={(e) => {
                    // Implementar lógica para atualizar a descrição
                    console.log(`Atualizando descrição da transação ${transacao.id}: ${e.target.value}`);
                  }}
                />
              </TableCell>
              <TableCell>R$ {transacao.valor.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isRelatorioOpen} onOpenChange={setIsRelatorioOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">Fechamento de Caixa</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relatório de Fechamento de Caixa</DialogTitle>
          </DialogHeader>
          <div>
            <p>Saldo Inicial: R$ {gerarRelatorio().saldoInicial.toFixed(2)}</p>
            <p>Total de Vendas: R$ {gerarRelatorio().totalVendas.toFixed(2)}</p>
            <p>Total de Pagamentos: R$ {gerarRelatorio().totalPagamentos.toFixed(2)}</p>
            <p>Saldo Final: R$ {gerarRelatorio().saldoFinal.toFixed(2)}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Caixa;
