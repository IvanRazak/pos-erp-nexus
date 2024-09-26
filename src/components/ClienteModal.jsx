import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '../lib/supabase';

const ClienteModal = ({ cliente, onClose, onUpdate }) => {
  const { data: pedidos, isLoading, error } = useQuery({
    queryKey: ['pedidosCliente', cliente.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total_amount, status')
        .eq('customer_id', cliente.id);
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Carregando pedidos...</div>;
  if (error) return <div>Erro ao carregar pedidos: {error.message}</div>;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pedidos de {cliente.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos?.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.order_number}</TableCell>
                  <TableCell>{new Date(pedido.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{pedido.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModal;
