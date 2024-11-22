import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";

const PedidoDetalhesHeader = ({ pedido, onPrint, onExportPDF }) => {
  return (
    <DialogHeader className="p-6">
      <div className="flex justify-between items-center">
        <DialogTitle>Detalhes do Pedido #{pedido.order_number}</DialogTitle>
        <div className="flex gap-2">
          <Button onClick={onPrint} variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button onClick={onExportPDF} variant="outline" size="icon">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
};

export default PedidoDetalhesHeader;