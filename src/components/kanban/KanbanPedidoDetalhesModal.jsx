import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import { supabase } from '../../lib/supabase';
import { generatePrintContent } from '../../utils/printUtils';
import { toast } from "sonner";
import jsPDF from 'jspdf';
import KanbanPedidoDetalhesTable from './KanbanPedidoDetalhesTable';

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
              price
            ),
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
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    doc.setFontSize(16);
    doc.text(`Pedido #${pedido.order_number}`, 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Cliente: ${pedido.customer?.name || 'N/A'}`, 10, 30);
    doc.text(`Data do Pedido: ${new Date(pedido.created_at).toLocaleDateString()}`, 10, 40);
    doc.text(`Data de Entrega: ${pedido.delivery_date ? new Date(pedido.delivery_date).toLocaleDateString() : 'N/A'}`, 10, 50);
    
    doc.save(`pedido-${pedido.order_number}.pdf`);
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
                <KanbanPedidoDetalhesTable 
                  itensPedido={itensPedido}
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