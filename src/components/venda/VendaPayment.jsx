import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VendaPayment = ({ 
  opcaoPagamento, 
  setOpcaoPagamento, 
  opcoesPagamento, 
  valorPago, 
  setValorPago 
}) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Forma de Pagamento</label>
        <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {opcoesPagamento?.map((opcao) => (
              <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Valor Pago (R$)</label>
        <Input 
          type="number" 
          placeholder="0.00" 
          value={valorPago} 
          onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
        />
      </div>
    </>
  );
};

export default VendaPayment;