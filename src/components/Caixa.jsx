import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { usePaymentOptions, useTransactions, useAddPayment, useUpdatePayment, useDeletePayment } from '../integrations/supabase';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import EditarPagamentoModal from './EditarPagamentoModal';
import AdicionarPagamentoModal from './AdicionarPagamentoModal';

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

  const handleDeletePayment = async (paymentId) => {
    try {
      await deletePayment.mutateAsync(paymentId);
      toast({
        title: "Pagamento excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoadingTransactions || isLoadingPaymentOptions) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Controle de Caixa</h2>
      
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setIsAddPaymentOpen(true)}>
          Adicionar Pagamento
        </Button>
      </div>

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
        <div className="flex items-center space-x-2">
          <Switch
            id="mostrar-cancelados"
            checked={mostrarCancelados}
            onCheckedChange={setMostrarCancelados}
          />
          <label htmlFor="mostrar-cancelados">
            Mostrar Pagamentos Cancelados
          </label>
        </div>
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
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarTransacoes().map((transacao) => (
            <TableRow 
              key={transacao.id}
              className={transacao.cancelled ? 'bg-red-50 opacity-70' : ''}
            >
              <TableCell>{transacao.order?.order_number || 'N/A'}</TableCell>
              <TableCell>{transacao.order?.customer?.name || 'N/A'}</TableCell>
              <TableCell>{transacao.payment_option || 'N/A'}</TableCell>
              <TableCell>{transacao.payment_date ? format(parseISO(transacao.payment_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
              <TableCell>
                <Input
                  defaultValue={transacao.description || ''}
                  onChange={(e) => {
                    console.log(`Atualizando descrição da transação ${transacao.id}: ${e.target.value}`);
                  }}
                />
              </TableCell>
              <TableCell>R$ {transacao.amount ? transacao.amount.toFixed(2) : '0.00'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingPayment(transacao)}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePayment(transacao.id)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isRelatorioOpen} onOpenChange={setIsRelatorioOpen}>
        <DialogHeader>
          <DialogTitle>Relatório de Fechamento de Caixa</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div>
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
