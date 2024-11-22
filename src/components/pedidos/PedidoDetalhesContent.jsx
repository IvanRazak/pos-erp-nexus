import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import PedidoDetalhesTable from './PedidoDetalhesTable';

const PedidoDetalhesContent = ({ itensPedido, pedido, renderExtras, calcularTotalDescontos }) => {
  return (
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
  );
};

export default PedidoDetalhesContent;