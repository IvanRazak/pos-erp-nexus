import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '../lib/supabase';
import { formatarDimensoes, formatarM2 } from '../utils/pedidoUtils';

const PedidoDetalhesModal = ({ pedido, onClose }) => {
  const { data: itensPedido, isLoading } = useQuery({
    queryKey: ['pedidoItens', pedido.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*),
          extras:order_item_extras(
            id,
            extra_option:extra_options(id, name, type, price),
            value,
            inserted_value,
            total_value,
            selected_option:selection_options(id, name, value)
          )
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  const calcularSubtotalItem = (item) => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras.reduce((sum, extra) => sum + (extra.total_value || 0), 0);
    return subtotalProduto + subtotalExtras;
  };

  const renderExtras = (extras) => {
    return extras.map((extra) => (
      <div key={extra.id}>
        {extra.extra_option.name}:
        {extra.extra_option.type === 'number'
          ? ` ${extra.inserted_value} x R$ ${extra.extra_option.price.toFixed(2)} = R$ ${extra.total_value.toFixed(2)}`
          : extra.extra_option.type === 'select'
          ? ` ${extra.selected_option.name} - R$ ${extra.selected_option.value.toFixed(2)}`
          : ` R$ ${extra.extra_option.price.toFixed(2)}`
        }
      </div>
    ));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{pedido.order_number}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Opções Extras</TableHead>
                <TableHead>Dimensões</TableHead>
                <TableHead>M²</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensPedido?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                  <TableCell>{renderExtras(item.extras)}</TableCell>
                  <TableCell>{formatarDimensoes(item)}</TableCell>
                  <TableCell>{formatarM2(item)}</TableCell>
                  <TableCell>{item.description || 'N/A'}</TableCell>
                  <TableCell>R$ {calcularSubtotalItem(item).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhesModal;