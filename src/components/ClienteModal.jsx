import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ClienteModal = ({ cliente, onClose }) => {
  const { data: pedidos, isLoading, error } = useQuery({
    queryKey: ['pedidosCliente', cliente.id],
    queryFn: () => {
      // Aqui você implementaria a chamada à API para buscar os pedidos do cliente
      return [
        { id: 1, data: '2023-05-01', valor: 150.00, status: 'Entregue' },
        { id: 2, data: '2023-05-15', valor: 200.00, status: 'Em andamento' },
      ];
    },
  });

  if (isLoading) return <div>Carregando pedidos...</div>;
  if (error) return <div>Erro ao carregar pedidos: {error.message}</div>;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pedidos de {cliente.nome}</DialogTitle>
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
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.data}</TableCell>
                <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
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