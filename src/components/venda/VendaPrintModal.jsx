import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";

const VendaPrintModal = ({ isOpen, onClose, venda }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!venda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Imprimir Venda</DialogTitle>
        </DialogHeader>
        <div className="print:p-4">
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold">Dados do Cliente</h3>
              <p>Nome: {venda.cliente?.name || 'N/A'}</p>
              <p>Email: {venda.cliente?.email || 'N/A'}</p>
              <p>Telefone: {venda.cliente?.phone || 'N/A'}</p>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold">Detalhes da Venda</h3>
              <p>Data de Entrega: {format(new Date(venda.dataEntrega), 'dd/MM/yyyy')}</p>
              <p>Forma de Pagamento: {venda.opcaoPagamento}</p>
              <p>Valor Total: R$ {venda.totalVenda?.toFixed(2)}</p>
              <p>Valor Pago: R$ {venda.valorPago?.toFixed(2)}</p>
              <p>Desconto: R$ {venda.desconto?.toFixed(2)}</p>
              {venda.valorAdicional > 0 && (
                <>
                  <p>Valor Adicional: R$ {venda.valorAdicional?.toFixed(2)}</p>
                  <p>Descrição Valor Adicional: {venda.descricaoValorAdicional}</p>
                </>
              )}
              <p>Saldo Restante: R$ {Math.max(venda.totalVenda - venda.valorPago, 0).toFixed(2)}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Produtos</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Qtd</th>
                    <th className="text-left p-2">Dimensões</th>
                    <th className="text-left p-2">Valor Unit.</th>
                    <th className="text-left p-2">Extras</th>
                    <th className="text-left p-2">Desconto</th>
                    <th className="text-left p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {venda.carrinho.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.quantidade}</td>
                      <td className="p-2">
                        {item.unit_type === 'square_meter' 
                          ? `${item.largura}m x ${item.altura}m` 
                          : item.format || 'N/A'}
                      </td>
                      <td className="p-2">R$ {item.unitPrice?.toFixed(2)}</td>
                      <td className="p-2">
                        {item.extras.map((extra, i) => (
                          <div key={i}>
                            {extra.name}: {extra.type === 'select' 
                              ? extra.selectedOptionName 
                              : extra.type === 'number' 
                                ? extra.value 
                                : 'Sim'}
                          </div>
                        ))}
                      </td>
                      <td className="p-2">R$ {(item.discount || 0).toFixed(2)}</td>
                      <td className="p-2">R$ {(item.total - (item.discount || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 print:hidden">
            <Button onClick={handlePrint} className="w-full">
              <PrinterIcon className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendaPrintModal;