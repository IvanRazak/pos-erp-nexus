import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SelectOptionsModal = ({ isOpen, onClose, onSave, initialOptions = [] }) => {
  const [options, setOptions] = useState(initialOptions);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opções de Seleção</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Nova opção"
            />
            <Button onClick={handleAddOption}>Adicionar</Button>
          </div>
          <ul className="space-y-2">
            {options.map((option, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{option}</span>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveOption(index)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectOptionsModal;