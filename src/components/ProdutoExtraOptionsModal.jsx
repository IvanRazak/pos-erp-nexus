import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSelectionOptions } from '../integrations/supabase/hooks/extra_options';
import { toast } from "@/components/ui/use-toast";

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);
  const { data: selectionOptions } = useSelectionOptions();

  const produtoOpcoesExtras = opcoesExtras?.filter(opcao => 
    produto.extra_options?.includes(opcao.id)
  );

  useEffect(() => {
    const initialExtras = produtoOpcoesExtras?.map(opcao => ({
      ...opcao,
      value: opcao.type === 'select' ? '' : (opcao.type === 'checkbox' ? false : ''),
      totalPrice: 0,
    }));
    setExtrasEscolhidas(initialExtras || []);
  }, [produtoOpcoesExtras]);

  const handleExtraChange = (extraId, value) => {
    setExtrasEscolhidas(prev => prev.map(item => {
      if (item.id === extraId) {
        return calculateExtraPrice({ ...item, value });
      }
      return item;
    }));
  };

  const calculateExtraPrice = (extra) => {
    let totalPrice = 0;
    let selectedOptionName = '';
    if (extra.type === 'select' && extra.value) {
      const selectedOption = selectionOptions?.find(so => so.id === extra.value);
      totalPrice = selectedOption?.value ?? 0;
      selectedOptionName = selectedOption?.name ?? '';
    } else if (extra.type === 'number' && extra.value) {
      totalPrice = (extra.price ?? 0) * parseFloat(extra.value);
    } else if (extra.type === 'checkbox' && extra.value) {
      totalPrice = extra.price ?? 0;
    }
    return { ...extra, totalPrice, selectedOptionName };
  };

  const handleConfirm = () => {
    const unselectedRequiredOptions = extrasEscolhidas.filter(
      extra => extra.type === 'select' && extra.required && !extra.value
    );

    if (unselectedRequiredOptions.length > 0) {
      const optionNames = unselectedRequiredOptions.map(option => option.name).join(', ');
      toast({
        title: "Opções obrigatórias não selecionadas",
        description: `Por favor, selecione as seguintes opções obrigatórias: ${optionNames}`,
        variant: "destructive",
      });
      return;
    }

    const selectedExtras = extrasEscolhidas.filter(extra => 
      (extra.type === 'select' && extra.value) ||
      (extra.type === 'number' && extra.value) ||
      (extra.type === 'checkbox' && extra.value === true)
    );

    onConfirm(selectedExtras);
    onClose();
  };

  const renderExtraOption = (opcao) => {
    switch (opcao.type) {
      case 'select':
        const options = selectionOptions?.filter(so => opcao.selection_options?.includes(so.id)) || [];
        return (
          <Select
            value={opcao.value}
            onValueChange={(value) => handleExtraChange(opcao.id, value)}
          >
            <SelectTrigger className={opcao.required ? "border-red-500" : ""}>
              <SelectValue placeholder={opcao.required ? "Selecione uma opção (obrigatório)" : "Selecione uma opção"} />
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
            value={opcao.value}
            onChange={(e) => handleExtraChange(opcao.id, e.target.value)}
          />
        );
      default:
        return (
          <Checkbox
            id={`extra-${opcao.id}`}
            checked={opcao.value}
            onCheckedChange={(checked) => handleExtraChange(opcao.id, checked)}
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
          {extrasEscolhidas.map((opcao) => (
            <div key={opcao.id} className="flex items-center space-x-2">
              <label htmlFor={`extra-${opcao.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {opcao.name}
                {opcao.required && opcao.type === 'select' && ' (Obrigatório)'}
                {opcao.type !== 'select' && ` - R$ ${opcao.price?.toFixed(2) ?? 'N/A'}`}
                {opcao.totalPrice > 0 && 
                  ` (Total: R$ ${opcao.totalPrice.toFixed(2)})`
                }
                {opcao.selectedOptionName && 
                  ` - ${opcao.selectedOptionName}`
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