import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from '../integrations/supabase';

const ClienteModal = ({ cliente, onClose, onUpdate }) => {
  const { data: pedidos, isLoading, error } = useOrders({
    queryKey: ['pedidosCliente', cliente.id],
    queryFn: () => supabase.from('orders').select('*').eq('customer_id', cliente.id)
  });

  if (isLoading) return <div>Carregando pedidos...</div>;
  if (error) return <div>Erro ao carregar pedidos: {error.message}</div>;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pedidos de {cliente.name}</DialogTitle>
          <DialogDescription>
            Lista de pedidos realizados por este cliente.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos?.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{new Date(pedido.created_at).toLocaleDateString()}</TableCell>
                <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
                <TableCell>{pedido.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModal;
