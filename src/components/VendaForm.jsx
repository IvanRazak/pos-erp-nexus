import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VendaForm = ({ produtos, selectedClienteName, onOpenBuscarCliente, onProdutoSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
        <Select onValueChange={(value) => onProdutoSelect(produtos.find(p => p.id === value))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {produtos?.map((produto) => (
              <SelectItem key={produto.id} value={produto.id}>{produto.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Selecionar Cliente</h3>
        <div className="flex items-center space-x-2">
          <Input
            value={selectedClienteName}
            placeholder="Cliente selecionado"
            readOnly
            className="flex-grow"
          />
          <Button onClick={onOpenBuscarCliente}>
            Buscar Cliente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendaForm;