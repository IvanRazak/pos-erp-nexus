import React from 'react';
import { Input } from "@/components/ui/input";

const VendaAdditionalValues = ({
  desconto,
  setDesconto,
  valorAdicional,
  setValorAdicional,
  descricaoValorAdicional,
  setDescricaoValorAdicional
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Desconto Geral (R$)</label>
        <Input 
          type="number" 
          placeholder="0.00" 
          value={desconto} 
          onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor Adicional (R$)</label>
        <Input 
          type="number" 
          placeholder="0.00" 
          value={valorAdicional} 
          onChange={(e) => setValorAdicional(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição do Valor Adicional</label>
        <Input 
          type="text" 
          placeholder="Ex: Taxa de entrega" 
          value={descricaoValorAdicional} 
          onChange={(e) => setDescricaoValorAdicional(e.target.value)}
        />
      </div>
    </div>
  );
};

export default VendaAdditionalValues;