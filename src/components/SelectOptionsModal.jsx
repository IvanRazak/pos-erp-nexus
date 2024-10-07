import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SelectOptionsModal = ({ isOpen, onClose, onSave, initialOptions = [], title = 'Opções de Seleção' }) => {
  const [options, setOptions] = useState(initialOptions);
  const [newOption, setNewOption] = useState({ name: '', price: '' });
  const [selectionName, setSelectionName] = useState('');

  const handleAddOption = () => {
    if (newOption.name.trim() && newOption.price.trim()) {
      setOptions([...options, { ...newOption, price: parseFloat(newOption.price) }]);
      setNewOption({ name: '', price: '' });
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ name: selectionName, items: options });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={selectionName}
            onChange={(e) => setSelectionName(e.target.value)}
            placeholder="Nome da opção de seleção"
          />
          <div className="flex space-x-2">
            <Input
              value={newOption.name}
              onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
              placeholder="Nome da opção"
            />
            <Input
              type="number"
              value={newOption.price}
              onChange={(e) => setNewOption({ ...newOption, price: e.target.value })}
              placeholder="Preço"
            />
            <Button onClick={handleAddOption}>Adicionar</Button>
          </div>
          <ul className="space-y-2">
            {options.map((option, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{option.name} - R$ {option.price.toFixed(2)}</span>
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