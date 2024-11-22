import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import { supabase } from '../lib/supabase';
import { getExtraOptionPrice } from '../utils/vendaUtils';
import { generatePrintContent } from '../utils/printUtils';
import PedidoDetalhesTable from './pedidos/PedidoDetalhesTable';
import jsPDF from 'jspdf';

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
    
    const printContent = generatePrintContent(pedido, itensPedido);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const printContent = generatePrintContent(pedido, itensPedido);
    
    // Remove HTML tags and convert to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Configure initial settings
    doc.setFontSize(16);
    doc.text(`Pedido #${pedido.order_number}`, 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Cliente: ${pedido.customer?.name || 'N/A'}`, 10, 30);
    doc.text(`Data do Pedido: ${pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : 'N/A'}`, 10, 40);
    doc.text(`Data de Entrega: ${pedido.delivery_date ? new Date(pedido.delivery_date).toLocaleDateString() : 'N/A'}`, 10, 50);
    
    // Add items table header
    doc.setFontSize(14);
    doc.text('Itens do Pedido:', 10, 70);
    
    let y = 90;
    itensPedido?.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${item.product.name}`, 15, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.text(`Quantidade: ${item.quantity}`, 20, y);
      y += 7;
      
      if (item.width && item.height) {
        doc.text(`Dimensões: ${item.width}m x ${item.height}m`, 20, y);
        y += 7;
      }
      
      if (item.m2) {
        doc.text(`M²: ${item.m2.toFixed(2)}`, 20, y);
        y += 7;
      }
      
      doc.text(`Valor Unitário: R$ ${item.unit_price.toFixed(2)}`, 20, y);
      y += 7;
      
      if (item.extras?.length > 0) {
        doc.text('Opções Extras:', 20, y);
        y += 7;
        
        item.extras.forEach(extra => {
          const extraText = `- ${extra.extra_option.name}: R$ ${(extra.total_value || 0).toFixed(2)}`;
          doc.text(extraText, 25, y);
          y += 7;
        });
      }
      
      if (item.discount > 0) {
        doc.text(`Desconto: R$ ${item.discount.toFixed(2)}`, 20, y);
        y += 7;
      }
      
      const subtotal = (item.quantity * item.unit_price) - (item.discount || 0);
      doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, 20, y);
      y += 12;
    });
    
    // Add totals section
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Resumo:', 10, y);
    y += 10;
    
    doc.setFontSize(12);
    if (pedido.discount > 0) {
      doc.text(`Desconto Geral: R$ ${pedido.discount.toFixed(2)}`, 15, y);
      y += 7;
    }
    
    if (pedido.additional_value > 0) {
      doc.text(`Valor Adicional: R$ ${pedido.additional_value.toFixed(2)}`, 15, y);
      if (pedido.additional_value_description) {
        doc.text(`Descrição: ${pedido.additional_value_description}`, 15, y + 7);
        y += 14;
      } else {
        y += 7;
      }
    }
    
    doc.text(`Valor Total: R$ ${pedido.total_amount?.toFixed(2) || '0.00'}`, 15, y);
    y += 7;
    doc.text(`Valor Pago: R$ ${pedido.paid_amount?.toFixed(2) || '0.00'}`, 15, y);
    y += 7;
    doc.text(`Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2) || '0.00'}`, 15, y);
    
    doc.save(`pedido-${pedido.order_number}.pdf`);
  };

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

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
        extraText += ' *';
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
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="icon">
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-8rem)] w-full">
            <div className="p-6">
              <div className="overflow-x-auto">
                <PedidoDetalhesTable 
                  itensPedido={itensPedido}
                  renderExtras={renderExtras}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium">Total Descontos (Individuais + Geral): R$ {calcularTotalDescontos().toFixed(2)}</p>
                {pedido.additional_value > 0 && (
                  <div className="text-sm font-medium">
                    <p>Valor Adicional: R$ {pedido.additional_value.toFixed(2)}</p>
                    {pedido.additional_value_description && (
                      <p className="text-gray-600">Descrição: {pedido.additional_value_description}</p>
                    )}
                  </div>
                )}
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