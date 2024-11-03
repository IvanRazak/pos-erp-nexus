import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { usePaymentOptions, useTransactions, useAddPayment, useUpdatePayment, useDeletePayment } from '../integrations/supabase';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import EditarPagamentoModal from './EditarPagamentoModal';
import AdicionarPagamentoModal from './AdicionarPagamentoModal';
import CaixaFiltros from './CaixaFiltros';
import CaixaTabela from './CaixaTabela';

const Caixa = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroNumeroPedido, setFiltroNumeroPedido] = useState('');
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
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
      const transacaoDate = parseISO(transacao.payment_date);
      const matchData = (!filtroDataInicio || !filtroDataFim || isWithinInterval(transacaoDate, {
        start: startOfDay(filtroDataInicio),
        end: endOfDay(filtroDataFim)
      }));
      const matchOpcaoPagamento = !filtroOpcaoPagamento || transacao.payment_option === filtroOpcaoPagamento;
      const matchCliente = !filtroCliente || (transacao.order?.customer?.name && transacao.order.customer.name.toLowerCase().includes(filtroCliente.toLowerCase()));
      const matchNumeroPedido = !filtroNumeroPedido || (transacao.order?.order_number && transacao.order.order_number.toString().includes(filtroNumeroPedido));
      const matchCancelado = mostrarCancelados ? transacao.cancelled : !transacao.cancelled;
      return matchData && matchOpcaoPagamento && matchCliente && matchNumeroPedido && matchCancelado;
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
      
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setIsAddPaymentOpen(true)}>
          Adicionar Pagamento
        </Button>
        <Button onClick={() => setIsRelatorioOpen(true)}>
          Gerar Relatório
        </Button>
      </div>

      <CaixaFiltros
        filtroDataInicio={filtroDataInicio}
        setFiltroDataInicio={setFiltroDataInicio}
        filtroDataFim={filtroDataFim}
        setFiltroDataFim={setFiltroDataFim}
        filtroOpcaoPagamento={filtroOpcaoPagamento}
        setFiltroOpcaoPagamento={setFiltroOpcaoPagamento}
        filtroCliente={filtroCliente}
        setFiltroCliente={setFiltroCliente}
        filtroNumeroPedido={filtroNumeroPedido}
        setFiltroNumeroPedido={setFiltroNumeroPedido}
        mostrarCancelados={mostrarCancelados}
        setMostrarCancelados={setMostrarCancelados}
        paymentOptions={paymentOptions}
      />

      <CaixaTabela
        transacoes={filtrarTransacoes()}
        setEditingPayment={setEditingPayment}
      />

      <Dialog open={isRelatorioOpen} onOpenChange={setIsRelatorioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relatório de Fechamento de Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Saldo Inicial: R$ {gerarRelatorio().saldoInicial.toFixed(2)}</p>
            <p>Total de Vendas: R$ {gerarRelatorio().totalVendas.toFixed(2)}</p>
            <p>Total de Pagamentos: R$ {gerarRelatorio().totalPagamentos.toFixed(2)}</p>
            <p>Saldo Final: R$ {gerarRelatorio().saldoFinal.toFixed(2)}</p>
          </div>
        </DialogContent>
      </Dialog>

      {editingPayment && (
        <EditarPagamentoModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          paymentOptions={paymentOptions}
        />
      )}

      <AdicionarPagamentoModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        paymentOptions={paymentOptions}
      />
    </div>
  );
};

export default Caixa;