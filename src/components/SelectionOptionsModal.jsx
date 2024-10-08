import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SelectionOptionsModal = ({ isOpen, onClose, onSave, selectionOptions, selectedOptions }) => {
  const [selected, setSelected] = useState(selectedOptions || []);

  useEffect(() => {
    setSelected(selectedOptions || []);
  }, [selectedOptions]);

  const handleToggle = (optionId) => {
    setSelected(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Opções de Seleção</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {selectionOptions?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`option-${option.id}`}
                checked={selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <label htmlFor={`option-${option.id}`}>
                {option.name} - R$ {option.value.toFixed(2)}
              </label>
            </div>
          ))}
        </ScrollArea>
        <Button onClick={handleSave}>Salvar</Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectionOptionsModal;