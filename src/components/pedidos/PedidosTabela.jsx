import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useAddEventLog } from '../../integrations/supabase/hooks/events_log';
import { useAuth } from '../../hooks/useAuth';

const PedidosTabela = ({ 
  pedidos, 
  clientes, 
  atualizarStatus, 
  abrirModalDetalhes, 
  handleCancelarPedido,
  descontosIndividuais = {} 
}) => {
  const addEventLog = useAddEventLog();
  const { user } = useAuth();

  const handleStatusChange = async (pedidoId, novoStatus, pedidoAtual) => {
    await atualizarStatus(pedidoId, novoStatus);
    
    // Registrar a mudança de status no log de eventos
    if (user) {
      await addEventLog.mutateAsync({
        user_name: user.username,
        description: `Alterou status do pedido ${pedidoAtual.order_number} de ${pedidoAtual.status} para ${novoStatus}`,
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número do Pedido</TableHead>
          <TableHead>Data e Hora</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Descontos Individuais</TableHead>
          <TableHead>Desconto Geral</TableHead>
          <TableHead>Valor Adicional</TableHead>
          <TableHead>Data de Entrega</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado por</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pedidos.map((pedido) => (
          <TableRow 
            key={pedido.id}
            className={pedido.status === 'cancelled' ? 'opacity-60' : ''}
          >
            <TableCell>{pedido.order_number}</TableCell>
            <TableCell>{pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</TableCell>
            <TableCell>{clientes?.find(c => c.id === pedido.customer_id)?.name || 'N/A'}</TableCell>
            <TableCell>R$ {pedido.total_amount?.toFixed(2) || 'N/A'}</TableCell>
            <TableCell>R$ {(descontosIndividuais[pedido.id] || 0).toFixed(2)}</TableCell>
            <TableCell>R$ {pedido.discount?.toFixed(2) || '0.00'}</TableCell>
            <TableCell>{pedido.additional_value > 0 ? (
              <>
                R$ {pedido.additional_value.toFixed(2)}
                <br />
                <span className="text-sm text-gray-500">{pedido.additional_value_description || 'Sem descrição'}</span>
              </>
            ) : 'N/A'}</TableCell>
            <TableCell>{pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
            <TableCell>
              <Select 
                defaultValue={pedido.status} 
                onValueChange={(value) => handleStatusChange(pedido.id, value, pedido)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Atualizar Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_production">Em Produção</SelectItem>
                  <SelectItem value="awaiting_approval">Aguardando Aprovação</SelectItem>
                  <SelectItem value="ready_for_pickup">Pronto para Retirada</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{pedido.created_by || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button onClick={() => abrirModalDetalhes(pedido)}>
                  Ver Detalhes
                </Button>
                {pedido.status !== 'cancelled' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancelar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancelarPedido(pedido.id)}>
                          Sim, cancelar pedido
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PedidosTabela;