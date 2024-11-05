import React, { useState } from 'react';
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeletePayment, useUpdateOrder } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../hooks/useAuth';

const CaixaTabela = ({ transacoes, setEditingPayment }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const deletePayment = useDeletePayment();
  const updateOrder = useUpdateOrder();
  const { user } = useAuth();

  const handleDeletePayment = async (payment) => {
    try {
      if (payment.order && payment.order.id) {
        // Primeiro, atualiza o pedido
        await updateOrder.mutateAsync({
          id: payment.order.id,
          paid_amount: 0, // Reseta o valor pago
          remaining_balance: payment.order.total_amount, // Restaura o saldo total
          status: 'partial_payment'
        });
      }

      // Depois, exclui o pagamento
      await deletePayment.mutateAsync(payment.id);

      toast({
        title: "Pagamento excluído com sucesso!",
        description: "Os valores do pedido foram atualizados.",
      });
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: "Erro ao excluir pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calcula o índice inicial e final dos itens da página atual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transacoes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transacoes.length / itemsPerPage);

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
        <div className="text-sm text-gray-500">
          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, transacoes.length)} de {transacoes.length} registros
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

export default CaixaTabela;