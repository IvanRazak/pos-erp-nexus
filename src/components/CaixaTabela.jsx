import React from 'react';
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeletePayment } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const CaixaTabela = ({ transacoes, setEditingPayment }) => {
  const deletePayment = useDeletePayment();

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

  return (
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
        {transacoes.map((transacao) => (
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
  );
};

export default CaixaTabela;