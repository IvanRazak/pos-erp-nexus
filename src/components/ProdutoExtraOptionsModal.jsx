import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSelectionOptions } from '../integrations/supabase/hooks/extra_options';

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);
  const { data: selectionOptions } = useSelectionOptions();

  const produtoOpcoesExtras = opcoesExtras?.filter(opcao => 
    produto.extra_options?.includes(opcao.id)
  );

  const handleExtraChange = (extra, value) => {
    setExtrasEscolhidas(prev => {
      const existingIndex = prev.findIndex(item => item.id === extra.id);
      
      // Calcula o preço total baseado no tipo da opção
      let totalPrice = 0;
      let selectedOptionName = '';
      
      if (extra.type === 'select' && value) {
        const selectedOption = selectionOptions?.find(so => so.id === value);
        if (selectedOption) {
          totalPrice = (extra.price || 0) + (selectedOption.value || 0);
          selectedOptionName = selectedOption.name;
        }
      } else if (extra.type === 'number') {
        totalPrice = (extra.price || 0) * parseFloat(value || 1);
      } else if (extra.type === 'checkbox' && value) {
        totalPrice = extra.price || 0;
      }

      const updatedExtra = {
        ...extra,
        value,
        totalPrice,
        type: extra.type,
        selectedOptionName
      };

      if (existingIndex !== -1) {
        if (value === null || value === undefined || value === false) {
          const newExtras = [...prev];
          newExtras.splice(existingIndex, 1);
          return newExtras;
        }
        const newExtras = [...prev];
        newExtras[existingIndex] = updatedExtra;
        return newExtras;
      }

      if (value !== null && value !== undefined && value !== false) {
        return [...prev, updatedExtra];
      }

      return prev;
    });
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {opcao.name}
                {opcao.type !== 'select' && ` - R$ ${opcao.price?.toFixed(2) ?? 'N/A'}`}
                {extrasEscolhidas.find(e => e.id === opcao.id)?.totalPrice && 
                  ` (Total: R$ ${extrasEscolhidas.find(e => e.id === opcao.id).totalPrice.toFixed(2)})`
                }
                {extrasEscolhidas.find(e => e.id === opcao.id)?.selectedOptionName && 
                  ` - ${extrasEscolhidas.find(e => e.id === opcao.id).selectedOptionName}`
                }
              </label>
              {opcao.type === 'select' ? (
                <Select onValueChange={(value) => handleExtraChange(opcao, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectionOptions
                      ?.filter(so => opcao.selection_options?.includes(so.id))
                      .map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} - R$ {option.value.toFixed(2)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : opcao.type === 'number' ? (
                <Input
                  type="number"
                  placeholder="Valor"
                  onChange={(e) => handleExtraChange(opcao, e.target.value)}
                />
              ) : (
                <Checkbox
                  onCheckedChange={(checked) => handleExtraChange(opcao, checked)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(extrasEscolhidas)}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoExtraOptionsModal;