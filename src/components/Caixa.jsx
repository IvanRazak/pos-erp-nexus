import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePaymentOptions, useTransactions } from '../integrations/supabase';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

const Caixa = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroNumeroPedido, setFiltroNumeroPedido] = useState('');
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: paymentOptions, isLoading: isLoadingPaymentOptions } = usePaymentOptions();
  const { data: transacoes, isLoading: isLoadingTransactions } = useTransactions();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const filtrarTransacoes = () => {
    if (!transacoes) return [];
    
    return transacoes.filter(transacao => {
      // Primeiro filtra por pedidos cancelados
      if (!mostrarCancelados && transacao.order?.status === 'cancelled') {
        return false;
      }
      
      const transacaoDate = parseISO(transacao.payment_date);
      const matchData = (!filtroDataInicio || !filtroDataFim || isWithinInterval(transacaoDate, {
        start: startOfDay(filtroDataInicio),
        end: endOfDay(filtroDataFim)
      }));
      const matchOpcaoPagamento = !filtroOpcaoPagamento || transacao.payment_option === filtroOpcaoPagamento;
      const matchCliente = !filtroCliente || (transacao.order?.customer?.name && transacao.order.customer.name.toLowerCase().includes(filtroCliente.toLowerCase()));
      const matchNumeroPedido = !filtroNumeroPedido || (transacao.order?.order_number && transacao.order.order_number.toString().includes(filtroNumeroPedido));
      
      return matchData && matchOpcaoPagamento && matchCliente && matchNumeroPedido;
    });
  };

  const gerarRelatorio = () => {
    const transacoesFiltradas = filtrarTransacoes();
    const totalVendas = transacoesFiltradas.reduce((acc, transacao) => acc + (transacao.amount || 0), 0);
    const saldoInicial = 1000;
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
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <DatePicker
          selected={filtroDataFim}
          onChange={setFiltroDataFim}
          placeholderText="Data Fim"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <Select onValueChange={setFiltroOpcaoPagamento} value={filtroOpcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {paymentOptions?.map((option) => (
              <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filtrar por nome do cliente"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        />
        <Input
          placeholder="Filtrar por número do pedido"
          value={filtroNumeroPedido}
          onChange={(e) => setFiltroNumeroPedido(e.target.value)}
        />
        <Button 
          variant={mostrarCancelados ? "destructive" : "outline"}
          onClick={() => setMostrarCancelados(!mostrarCancelados)}
        >
          {mostrarCancelados ? "Ocultar Cancelados" : "Mostrar Cancelados"}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Opção de Pagamento</TableHead>
            <TableHead>Data do Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarTransacoes().map((transacao) => (
            <TableRow 
              key={transacao.id}
              className={transacao.order?.status === 'cancelled' ? 'bg-red-100' : ''}
            >
              <TableCell>{transacao.order?.order_number || 'N/A'}</TableCell>
              <TableCell>{transacao.order?.customer?.name || 'N/A'}</TableCell>
              <TableCell>{transacao.payment_option || 'N/A'}</TableCell>
              <TableCell>{transacao.payment_date ? format(parseISO(transacao.payment_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
              <TableCell>{transacao.order?.status || 'N/A'}</TableCell>
              <TableCell>R$ {transacao.amount ? transacao.amount.toFixed(2) : '0.00'}</TableCell>
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