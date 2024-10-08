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
          extras:order_item_extras(id, value, extra_option:extra_options(*))
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  const renderExtras = (extras) => {
    return extras.map((extra) => {
      const { extra_option, value } = extra;
      let displayText = `${extra_option.name}: `;
      
      if (extra_option.type === 'number' && value) {
        displayText += `${value} x R$ ${extra_option.price.toFixed(2)} = R$ ${(value * extra_option.price).toFixed(2)}`;
      } else if (extra_option.type === 'select' && extra_option.options) {
        const selectedOption = extra_option.options.find(opt => opt.id === value);
        if (selectedOption) {
          displayText += `${selectedOption.name} - R$ ${selectedOption.value.toFixed(2)}`;
        } else {
          displayText += `R$ ${extra_option.price.toFixed(2)}`;
        }
      } else {
        displayText += `R$ ${extra_option.price.toFixed(2)}`;
      }
      
      return <div key={extra.id}>{displayText}</div>;
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
