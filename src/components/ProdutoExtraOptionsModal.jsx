import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const ProdutoExtraOptionsModal = ({ produto, opcoesExtras, onClose, onConfirm }) => {
  const [extrasEscolhidas, setExtrasEscolhidas] = useState([]);

  const handleExtraChange = (extra) => {
    setExtrasEscolhidas(prev => {
      const isAlreadySelected = prev.some(item => item.id === extra.id);
      if (isAlreadySelected) {
        return prev.filter(item => item.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(extrasEscolhidas);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opções Extras para {produto.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {opcoesExtras?.map((opcao) => (
            <div key={opcao.id} className="flex items-center space-x-2">
              <Checkbox
                id={`extra-${opcao.id}`}
                checked={extrasEscolhidas.some(item => item.id === opcao.id)}
                onCheckedChange={() => handleExtraChange(opcao)}
              />
              <label htmlFor={`extra-${opcao.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {opcao.name} - R$ {opcao.price.toFixed(2)}
              </label>
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