import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { supabase } from '../lib/supabase';
import { formatarDimensoes, formatarM2 } from '../utils/pedidoUtils';
import { getExtraOptionPrice } from '../utils/vendaUtils';

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
              price,
              use_quantity_pricing,
              fixed_value
            ),
            value,
            inserted_value,
            total_value,
            selected_option:selection_options(id, name, value)
          )
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;

      // Atualizar os valores totais das opções extras considerando preços por quantidade
      for (const item of data) {
        for (const extra of item.extras) {
          if (extra.extra_option.use_quantity_pricing) {
            extra.total_value = await getExtraOptionPrice(
              {
                ...extra.extra_option,
                value: extra.inserted_value,
                totalPrice: extra.total_value
              },
              item.quantity
            );
          }
        }
      }

      return data;
    },
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Pedido #${pedido.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>Pedido #${pedido.order_number}</h2>
          <p><strong>Cliente:</strong> ${pedido.customer?.name || 'N/A'}</p>
          <p><strong>Data de Entrega:</strong> ${pedido.delivery_date || 'N/A'}</p>
          
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Dimensões</th>
                <th>Opções Extras</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itensPedido?.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>R$ ${item.unit_price.toFixed(2)}</td>
                  <td>${formatarDimensoes(item)}</td>
                  <td>${item.extras.map(extra => {
                    let extraText = `${extra.extra_option.name}: `;
                    const extraValue = extra.total_value || 0;
                    
                    if (extra.extra_option.type === 'select' && extra.selected_option) {
                      extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)}`;
                    } else if (extra.extra_option.type === 'number') {
                      extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)}`;
                    } else {
                      extraText += `R$ ${extraValue.toFixed(2)}`;
                    }
                    
                    return extraText;
                  }).join('<br>')}</td>
                  <td>R$ ${(item.quantity * item.unit_price + 
                    item.extras.reduce((sum, extra) => sum + (extra.total_value || 0), 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Valor Total: R$ ${pedido.total_amount?.toFixed(2) || '0.00'}</p>
            <p>Valor Pago: R$ ${pedido.paid_amount?.toFixed(2) || '0.00'}</p>
            <p>Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2) || '0.00'}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  const calcularSubtotalItem = (item) => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras.reduce((sum, extra) => {
      const extraValue = extra.total_value || 0;
      if (extra.extra_option.fixed_value) {
        return sum + extraValue;
      }
      return sum + (extraValue * item.quantity);
    }, 0);
    return subtotalProduto + subtotalExtras - (item.discount || 0);
  };

  const calcularTotalDescontos = () => {
    const descontosIndividuais = itensPedido.reduce((sum, item) => sum + (item.discount || 0), 0);
    const descontoGeral = pedido.discount || 0;
    return descontosIndividuais + descontoGeral;
  };

  const renderExtras = (extras, itemQuantity) => {
    return extras.map((extra) => {
      let extraText = `${extra.extra_option.name}: `;
      const extraValue = extra.total_value || 0;
      
      if (extra.extra_option.type === 'select' && extra.selected_option) {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      } else if (extra.extra_option.type === 'number') {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)} = R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      } else {
        if (extra.extra_option.fixed_value) {
          extraText += `R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      }
      
      if (extra.extra_option.use_quantity_pricing) {
        extraText += ' (Preço por quantidade)';
      }
      
      return <div key={extra.id}>{extraText}</div>;
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-0">
        <DialogHeader className="p-6">
          <div className="flex justify-between items-center">
            <DialogTitle>Detalhes do Pedido #{pedido.order_number}</DialogTitle>
            <Button onClick={handlePrint} variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-8rem)] w-full">
            <div className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Produto</TableHead>
                      <TableHead className="whitespace-nowrap">Quantidade</TableHead>
                      <TableHead className="whitespace-nowrap">Valor Unitário</TableHead>
                      <TableHead className="whitespace-nowrap">Opções Extras</TableHead>
                      <TableHead className="whitespace-nowrap">Dimensões</TableHead>
                      <TableHead className="whitespace-nowrap">M²</TableHead>
                      <TableHead className="whitespace-nowrap">Descrição</TableHead>
                      <TableHead className="whitespace-nowrap">Arte</TableHead>
                      <TableHead className="whitespace-nowrap">Desconto Individual</TableHead>
                      <TableHead className="whitespace-nowrap">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensPedido?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">{item.product.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
                        <TableCell className="whitespace-nowrap">R$ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">{renderExtras(item.extras, item.quantity)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatarDimensoes(item)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatarM2(item)}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.description || 'N/A'}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.arte_option || 'N/A'}</TableCell>
                        <TableCell className="whitespace-nowrap">R$ {(item.discount || 0).toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">R$ {calcularSubtotalItem(item).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium">Total Descontos (Individuais + Geral): R$ {calcularTotalDescontos().toFixed(2)}</p>
                <p className="text-sm font-medium">Valor Adicional: R$ {pedido.additional_value?.toFixed(2) || '0.00'}</p>
                <p className="text-lg font-bold mt-2">Total Final: R$ {pedido.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhesModal;