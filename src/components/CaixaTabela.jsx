
import React, { useState } from 'react';
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeletePayment, useUpdateOrder, usePayments } from '../integrations/supabase';
import { toast } from "sonner";
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import PageSizeSelector from './ui/page-size-selector';

const CaixaTabela = ({ transacoes, setEditingPayment }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const deletePayment = useDeletePayment();
  const updateOrder = useUpdateOrder();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDeletePayment = async (payment) => {
    // Validação para permitir exclusão apenas de pagamentos com valor zero
    if (payment.amount !== 0) {
      toast.error("Não é possível excluir pagamentos com valor diferente de zero.", {
        description: "Apenas pagamentos com valor zero podem ser excluídos."
      });
      return;
    }

    try {
      // Primeiro, exclui o pagamento
      await deletePayment.mutateAsync(payment.id);

      // Se houver um pedido associado e o ID do pedido estiver definido
      if (payment.order && payment.order.id) {
        // Busca diretamente no banco de dados todos os pagamentos não cancelados do pedido
        const { data: orderPayments, error } = await supabase
          .from('payments')
          .select('amount')
          .eq('order_id', payment.order.id)
          .eq('cancelled', false);

        if (error) throw error;

        // Calcula o novo valor total pago somando os valores dos pagamentos
        const newPaidAmount = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Busca o valor total do pedido diretamente do banco
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('id', payment.order.id)
          .single();

        if (orderError) throw orderError;

        // Calcula o novo saldo restante
        const newRemainingBalance = orderData.total_amount - newPaidAmount;

        // Atualiza o pedido com os novos valores
        await updateOrder.mutateAsync({
          id: payment.order.id,
          paid_amount: newPaidAmount,
          remaining_balance: newRemainingBalance,
          status: newRemainingBalance <= 0 ? 'paid' : 'partial_payment'
        });

        // Invalida as queries para atualizar os dados
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['payments']);

        toast.success("Pagamento excluído com sucesso! Os valores do pedido foram atualizados.");
      } else {
        toast.success("Pagamento excluído com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast.error("Erro ao excluir pagamento: " + error.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transacoes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transacoes.length / itemsPerPage);

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  return (
    <div>
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
          {currentItems.map((transacao) => (
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
                  {user?.isAdmin && (
                    <>
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
                            <AlertDialogAction onClick={() => handleDeletePayment(transacao)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, transacoes.length)} de {transacoes.length} registros
          </div>
          <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
};
