import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import { supabase } from '../../lib/supabase';
import { getExtraOptionPrice } from '../../utils/vendaUtils';
import { generatePrintContent } from '../../utils/printUtils';
import KanbanPedidoDetalhesTable from './KanbanPedidoDetalhesTable';
import { toast } from "sonner";
import jsPDF from 'jspdf';

const KanbanPedidoDetalhesModal = ({ pedido, onClose }) => {
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

  const handlePrint = async () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão');
        return;
      }
      
      const printContent = await generatePrintContent(pedido, itensPedido);
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      toast.error('Erro ao gerar impressão: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const printContent = generatePrintContent(pedido, itensPedido);
    
    // Remove HTML tags and convert to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    doc.text(text, 10, 10);
    doc.save(`pedido-${pedido.order_number}.pdf`);
  };

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  const renderExtras = (extras, itemQuantity) => {
    return extras.map((extra) => {
      let extraText = `${extra.extra_option.name}: `;
      const extraValue = extra.total_value || 0;
      
      if (extra.extra_option.type === 'select' && extra.selected_option) {
        extraText += `${extra.selected_option.name}`;
      } else if (extra.extra_option.type === 'number') {
        extraText += `${extra.inserted_value}`;
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
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-8rem)] w-full">
            <div className="p-6">
              <div className="overflow-x-auto">
                <KanbanPedidoDetalhesTable 
                  itensPedido={itensPedido}
                  renderExtras={renderExtras}
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanPedidoDetalhesModal;
