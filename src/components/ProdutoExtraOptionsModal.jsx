import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSelectionOptions } from '../integrations/supabase';

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);
  const { data: selectionOptions } = useSelectionOptions();

  const produtoOpcoesExtras = opcoesExtras?.filter(opcao => 
    produto.extra_options?.includes(opcao.id)
  );

  useEffect(() => {
    const initialExtras = produtoOpcoesExtras?.map(opcao => ({
      id: opcao.id,
      name: opcao.name,
      type: opcao.type,
      value: opcao.type === 'checkbox' ? false : '',
      price: opcao.price || 0,
      totalPrice: 0,
      selectedOption: null
    }));
    setExtrasEscolhidas(initialExtras || []);
  }, [produtoOpcoesExtras]);

  const handleExtraChange = (extra, value) => {
    setExtrasEscolhidas(prev => prev.map(item => {
      if (item.id === extra.id) {
        let totalPrice = 0;
        let selectedOption = null;
        if (extra.type === 'number') {
          totalPrice = (extra.price || 0) * parseFloat(value || 0);
        } else if (extra.type === 'checkbox') {
          totalPrice = value ? (extra.price || 0) : 0;
        } else if (extra.type === 'select') {
          selectedOption = selectionOptions?.find(opt => opt.id === value);
          totalPrice = selectedOption ? selectedOption.value + (extra.price || 0) : 0;
        }
        return { ...item, value, totalPrice, selectedOption };
      }
      return item;
    }));
  };

  const handleConfirm = () => {
    const filteredExtras = extrasEscolhidas.filter(extra => 
      extra.value !== '' && extra.value !== false
    ).map(extra => ({
      ...extra,
      name: extra.selectedOption ? `${extra.name} - ${extra.selectedOption.name}` : extra.name,
      price: extra.totalPrice
    }));
    onConfirm(filteredExtras);
    onClose();
  };

  const renderExtraOption = (opcao) => {
    switch (opcao.type) {
      case 'select':
        const options = selectionOptions?.filter(opt => opcao.selection_options?.includes(opt.id)) || [];
        return (
          <Select
            onValueChange={(value) => handleExtraChange(opcao, value)}
            value={extrasEscolhidas.find(e => e.id === opcao.id)?.value || ''}
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
            value={extrasEscolhidas.find(e => e.id === opcao.id)?.value || ''}
            onChange={(e) => handleExtraChange(opcao, e.target.value)}
          />
        );
      default:
        return (
          <Checkbox
            id={`extra-${opcao.id}`}
            checked={extrasEscolhidas.find(e => e.id === opcao.id)?.value || false}
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
              </label>
              {renderExtraOption(opcao)}
              {extrasEscolhidas.find(e => e.id === opcao.id)?.totalPrice > 0 && (
                <span className="text-sm text-gray-500">
                  Total: R$ {extrasEscolhidas.find(e => e.id === opcao.id).totalPrice.toFixed(2)}
                </span>
              )}
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