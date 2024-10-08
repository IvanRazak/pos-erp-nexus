import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '../lib/supabase';
import { calcularSubtotalItem, formatarDimensoes, formatarM2 } from '../utils/pedidoUtils';

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
            extra_option:extra_options(*)
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
      const extraOption = extra.extra_option;
      let extraText = `${extraOption.name}: `;
      
      if (extraOption.type === 'select') {
        extraText += `${extraOption.selectedOptionName || ''} - R$ ${extraOption.price.toFixed(2)}`;
      } else if (extraOption.type === 'number') {
        extraText += `${extraOption.value || ''} x R$ ${extraOption.price.toFixed(2)} = R$ ${(extraOption.value * extraOption.price).toFixed(2)}`;
      } else {
        extraText += `R$ ${extraOption.price.toFixed(2)}`;
      }
      
      return <div key={extra.id}>{extraText}</div>;
    });
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