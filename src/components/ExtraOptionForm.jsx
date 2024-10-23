import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import SelectionOptionsModal from './SelectionOptionsModal';
import ExtraOptionQuantityPricesModal from './ExtraOptionQuantityPricesModal';
import { useSelectionOptions } from '../integrations/supabase';

const ExtraOptionForm = ({ extraOption = {}, onSave, onDelete }) => {
  const [localOption, setLocalOption] = useState(extraOption);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isQuantityPricesModalOpen, setIsQuantityPricesModalOpen] = useState(false);
  const { data: selectionOptions } = useSelectionOptions();
  const [quantityPrices, setQuantityPrices] = useState(extraOption.quantityPrices || []);

  useEffect(() => {
    setLocalOption(extraOption);
    setQuantityPrices(extraOption.quantityPrices || []);
  }, [extraOption]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...localOption, quantityPrices });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        value={localOption.name || ''}
        onChange={handleChange}
        placeholder="Nome da opção extra"
        required
      />
      
      <Select
        value={localOption.type || 'number'}
        onValueChange={(value) => setLocalOption(prev => ({ ...prev, type: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="number">Número</SelectItem>
          <SelectItem value="checkbox">Checkbox</SelectItem>
          <SelectItem value="select">Seleção</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="fixed_value"
          name="fixed_value"
          checked={localOption.fixed_value || false}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, fixed_value: checked }))}
        />
        <label htmlFor="fixed_value">Valor Fixo</label>
      </div>

      <Button type="submit">{extraOption.id ? 'Atualizar' : 'Adicionar'}</Button>
      {extraOption.id && (
        <Button type="button" variant="destructive" onClick={() => onDelete(extraOption.id)}>
          Excluir
        </Button>
      )}
    </form>
  );
};

export default ExtraOptionForm;
