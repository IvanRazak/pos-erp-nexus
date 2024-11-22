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
import { toast } from "sonner";

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
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Pedido #${pedido.order_number}`, 20, 20);
      
      // Add order info
      doc.setFontSize(12);
      doc.text(`Cliente: ${pedido.customer?.name || 'N/A'}`, 20, 35);
      doc.text(`Data de Entrega: ${pedido.delivery_date || 'N/A'}`, 20, 45);
      
      // Add items table
      let yPos = 60;
      doc.setFontSize(10);
      
      // Table headers
      doc.text("Produto", 20, yPos);
      doc.text("Qtd", 90, yPos);
      doc.text("Valor", 120, yPos);
      doc.text("Total", 150, yPos);
      
      yPos += 10;
      
      // Table content
      itensPedido?.forEach((item) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(item.product.name, 20, yPos);
        doc.text(item.quantity.toString(), 90, yPos);
        doc.text(`R$ ${item.unit_price.toFixed(2)}`, 120, yPos);
        doc.text(`R$ ${(item.quantity * item.unit_price).toFixed(2)}`, 150, yPos);
        
        yPos += 7;
        
        // Add extras if any
        item.extras?.forEach(extra => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const extraText = `${extra.extra_option.name}: R$ ${extra.total_value?.toFixed(2)}`;
          doc.text(`- ${extraText}`, 25, yPos);
          yPos += 7;
        });
      });
      
      // Add totals
      yPos += 10;
      doc.text(`Valor Total: R$ ${pedido.total_amount?.toFixed(2)}`, 20, yPos);
      yPos += 7;
      doc.text(`Valor Pago: R$ ${pedido.paid_amount?.toFixed(2)}`, 20, yPos);
      yPos += 7;
      doc.text(`Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2)}`, 20, yPos);
      
      // Save the PDF
      doc.save(`pedido-${pedido.order_number}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF");
    }
  };

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

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