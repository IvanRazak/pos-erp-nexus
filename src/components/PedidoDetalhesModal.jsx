import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '../lib/supabase';

const PedidoDetalhesModal = ({ pedido, onClose }) => {
  const { data: itensPedido, isLoading } = useQuery({
    queryKey: ['pedidoItens', pedido.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*),
          extras:order_item_extras(extra_option:extra_options(*))
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{pedido.id}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor Unitário</TableHead>
              <TableHead>Opções Extras</TableHead>
              <TableHead>Dimensões</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensPedido?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                <TableCell>
                  {item.extras.map((extra) => (
                    <div key={extra.id}>{extra.extra_option.name}: R$ {extra.extra_option.price.toFixed(2)}</div>
                  ))}
                </TableCell>
                <TableCell>
                  {item.product.unit_type === 'square_meter' ? (
                    `${item.width}m x ${item.height}m`
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  R$ {(item.quantity * item.unit_price + 
                    item.extras.reduce((sum, extra) => sum + extra.extra_option.price, 0)).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhesModal;
