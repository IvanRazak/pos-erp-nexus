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
            extra_option:extra_options(
              id,
              name,
              type,
              price
            ),
            value,
            selection_option:selection_options(
              id,
              name,
              value
            )
          )
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  const renderExtras = (extras) => {
    return extras.map((extra) => {
      const { extra_option, value, selection_option } = extra;
      let displayText = `${extra_option.name}: `;
      let totalPrice = 0;

      if (extra_option.type === 'select' && selection_option) {
        displayText += `${selection_option.name} - R$ ${selection_option.value.toFixed(2)}`;
        totalPrice = selection_option.value;
      } else if (extra_option.type === 'number') {
        const numericValue = parseFloat(value);
        totalPrice = numericValue * extra_option.price;
        displayText += `${numericValue} x R$ ${extra_option.price.toFixed(2)} = R$ ${totalPrice.toFixed(2)}`;
      } else {
        totalPrice = extra_option.price;
        displayText += `R$ ${totalPrice.toFixed(2)}`;
      }

      return <div key={extra.id}>{displayText}</div>;
    });
  };

  const calcularSubtotalItem = (item) => {
    const precoUnitarioBase = item.unit_price;
    const precoExtras = item.extras.reduce((sum, extra) => {
      if (extra.extra_option.type === 'select' && extra.selection_option) {
        return sum + extra.selection_option.value;
      } else if (extra.extra_option.type === 'number') {
        return sum + (parseFloat(extra.value) * extra.extra_option.price);
      }
      return sum + extra.extra_option.price;
    }, 0);
    return item.quantity * (precoUnitarioBase + precoExtras);
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