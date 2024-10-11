import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSelectionOptions } from '../integrations/supabase/hooks/extra_options';

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const { data: selectionOptions } = useSelectionOptions();

  const produtoOpcoesExtras = opcoesExtras?.filter(opcao => 
    produto.extra_options?.includes(opcao.id)
  );

  // Atualiza o estado para checar se todas as opções do tipo select estão preenchidas
  useEffect(() => {
    const allSelectsFilled = produtoOpcoesExtras
      ?.filter(opcao => opcao.type === 'select')
      ?.every(opcao => extrasEscolhidas.some(extra => extra.id === opcao.id && extra.value));

    setIsFormValid(allSelectsFilled);
  }, [extrasEscolhidas, produtoOpcoesExtras]);

  const handleExtraChange = (extra, value) => {
    setExtrasEscolhidas(prev => {
      const existingExtra = prev.find(item => item.id === extra.id);
      const updatedExtras = existingExtra
        ? prev.map(item => (item.id === extra.id ? calculateExtraPrice(extra, value) : item))
        : value !== null && value !== undefined 
          ? [...prev, calculateExtraPrice(extra, value)]
          : prev;

      return updatedExtras.filter(Boolean);
    });
  };

  const calculateExtraPrice = (extra, value) => {
    let totalPrice = extra.price ?? 0;
    let selectedOptionName = '';

    if (extra.type === 'select') {
      const selectedOption = selectionOptions?.find(so => so.id === value);
      totalPrice += selectedOption?.value ?? 0;
      selectedOptionName = selectedOption?.name ?? '';
    } else if (extra.type === 'number') {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) return null;
      totalPrice *= parsedValue;
    }

    return { ...extra, value, totalPrice, selectedOptionName };
  };

  const handleConfirm = () => {
    onConfirm(extrasEscolhidas);
    onClose();
  };

  const renderExtraOption = (opcao) => {
    switch (opcao.type) {
      case 'select':
        const options = selectionOptions?.filter(so => opcao.selection_options?.includes(so.id)) || [];
        return (
          <Select
            onValueChange={(value) => handleExtraChange(opcao, value)}
            defaultValue={extrasEscolhidas.find(e => e.id === opcao.id)?.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name} - R$ {option.value.toFixed(2)}
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
                {opcao.name}
                {opcao.type !== 'select' && ` - R$ ${opcao.price?.toFixed(2) ?? 'N/A'}`}
                {extrasEscolhidas.find(e => e.id === opcao.id)?.totalPrice && 
                  ` (Total: R$ ${extrasEscolhidas.find(e => e.id === opcao.id).totalPrice.toFixed(2)})`
                }
                {extrasEscolhidas.find(e => e.id === opcao.id)?.selectedOptionName && 
                  ` - ${extrasEscolhidas.find(e => e.id === opcao.id).selectedOptionName}`
                }
              </label>
              {renderExtraOption(opcao)}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!isFormValid}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoExtraOptionsModal;
