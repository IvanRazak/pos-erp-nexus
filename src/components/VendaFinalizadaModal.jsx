import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { generatePrintContent } from '../utils/printUtils';
import { toast } from "sonner";

const VendaFinalizadaModal = ({ isOpen, onClose, pedido, itensPedido }) => {
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
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Erro ao gerar impressão:', error);
      toast.error('Erro ao gerar impressão: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Venda Finalizada com Sucesso!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <p className="text-lg">Pedido #{pedido?.order_number}</p>
            <p>Cliente: {pedido?.customer?.name}</p>
            <p>Total: R$ {pedido?.total_amount?.toFixed(2)}</p>
            <p>Valor Pago: R$ {pedido?.paid_amount?.toFixed(2)}</p>
            <p>Saldo Restante: R$ {pedido?.remaining_balance?.toFixed(2)}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendaFinalizadaModal;