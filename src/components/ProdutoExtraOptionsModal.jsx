import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);

  const produtoOpcoesExtras = opcoesExtras?.filter(opcao => 
    produto.extra_options?.includes(opcao.id)
  );

  const handleExtraChange = (extra, value) => {
    setExtrasEscolhidas(prev => {
      const existingIndex = prev.findIndex(item => item.id === extra.id);
      if (existingIndex !== -1) {
        const updatedExtras = [...prev];
        if (value === null || value === undefined) {
          updatedExtras.splice(existingIndex, 1);
        } else {
          updatedExtras[existingIndex] = { 
            ...updatedExtras[existingIndex], 
            value,
            totalPrice: extra.type === 'number' ? extra.price * parseFloat(value) : extra.price
          };
        }
        return updatedExtras;
      } else if (value !== null && value !== undefined) {
        return [...prev, { 
          ...extra, 
          value,
          totalPrice: extra.type === 'number' ? extra.price * parseFloat(value) : extra.price
        }];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    onConfirm(extrasEscolhidas);
    onClose();
  };

  const renderExtraOption = (opcao) => {
    switch (opcao.type) {
      case 'select':
        const options = JSON.parse(opcao.options || '[]');
        return (
          <Select
            onValueChange={(value) => handleExtraChange(opcao, value)}
            defaultValue={extrasEscolhidas.find(e => e.id === opcao.id)?.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder="Valor"
            onChange={(e) => handleExtraChange(opcao, e.target.value)}
            defaultValue={extrasEscolhidas.find(e => e.id === opcao.id)?.value}
          />
        );
      default:
        return (
          <Checkbox
            id={`extra-${opcao.id}`}
            checked={extrasEscolhidas.some(item => item.id === opcao.id)}
            onCheckedChange={(checked) => handleExtraChange(opcao, checked)}
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opções Extras para {produto.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {produtoOpcoesExtras?.map((opcao) => (
            <div key={opcao.id} className="flex items-center space-x-2">
              <label htmlFor={`extra-${opcao.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {opcao.name} - R$ {opcao.price.toFixed(2)}
                {opcao.type === 'number' && extrasEscolhidas.find(e => e.id === opcao.id)?.value && 
                  ` (Total: R$ ${(opcao.price * parseFloat(extrasEscolhidas.find(e => e.id === opcao.id).value)).toFixed(2)})`
                }
              </label>
              {renderExtraOption(opcao)}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoExtraOptionsModal;