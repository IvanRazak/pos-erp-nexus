import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PagamentoDialog = ({ 
  pedido, 
  valorPagamento, 
  setValorPagamento, 
  opcaoPagamento, 
  setOpcaoPagamento, 
  opcoesPagamento,
  onConfirm 
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pagamento do Saldo Restante</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p>Saldo Restante: R$ {pedido.remaining_balance.toFixed(2)}</p>
        <Input
          type="number"
          placeholder="Valor do Pagamento"
          value={valorPagamento}
          onChange={(e) => setValorPagamento(parseFloat(e.target.value))}
        />
        <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            {opcoesPagamento?.map((opcao) => (
              <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onConfirm}>Confirmar Pagamento</Button>
      </div>
    </DialogContent>
  );
};

export default PagamentoDialog;