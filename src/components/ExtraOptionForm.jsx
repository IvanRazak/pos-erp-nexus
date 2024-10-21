import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectionOptionsModal from './SelectionOptionsModal';
import { useSelectionOptions, useExtraOptionQuantityPrices, useAddExtraOptionQuantityPrice, useUpdateExtraOptionQuantityPrice, useDeleteExtraOptionQuantityPrice } from '../integrations/supabase';

const ExtraOptionForm = ({ extraOption = {}, onSave, onDelete }) => {
  const [localOption, setLocalOption] = useState(extraOption);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const { data: selectionOptions } = useSelectionOptions();
  const { data: quantityPrices } = useExtraOptionQuantityPrices(extraOption.id);
  const [localQuantityPrices, setLocalQuantityPrices] = useState([
    { quantity: 1, price: 0 },
    { quantity: 100, price: 0 },
    { quantity: 500, price: 0 },
    { quantity: 1000, price: 0 },
    { quantity: 5000, price: 0 },
  ]);

  useEffect(() => {
    if (quantityPrices) {
      setLocalQuantityPrices(quantityPrices);
    }
  }, [quantityPrices]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuantityPriceChange = (index, field, value) => {
    const newQuantityPrices = [...localQuantityPrices];
    newQuantityPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setLocalQuantityPrices(newQuantityPrices);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localOption, localQuantityPrices);
  };

  const handleSelectionOptionsSave = (selectedOptions) => {
    setLocalOption(prev => ({ ...prev, selection_options: selectedOptions }));
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
          <SelectItem value="select">Seleção</SelectItem>
          <SelectItem value="checkbox">Checkbox</SelectItem>
        </SelectContent>
      </Select>
      {localOption.type !== 'select' && (
        <Input
          name="price"
          type="number"
          step="0.01"
          value={localOption.price || ''}
          onChange={handleChange}
          placeholder="Preço padrão"
          required
        />
      )}
      {(localOption.type === 'number' || localOption.type === 'checkbox') && (
        <div>
          <h4 className="mb-2">Tabela de Preços por Quantidade</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localQuantityPrices.map((price, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.quantity}
                      onChange={(e) => handleQuantityPriceChange(index, 'quantity', e.target.value)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.price}
                      onChange={(e) => handleQuantityPriceChange(index, 'price', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {localOption.type === 'select' && (
        <Button type="button" onClick={() => setIsSelectionModalOpen(true)}>
          Gerenciar Opções de Seleção
        </Button>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="editable_in_cart"
          name="editable_in_cart"
          checked={localOption.editable_in_cart || false}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, editable_in_cart: checked }))}
        />
        <label htmlFor="editable_in_cart">Editável no carrinho</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          name="required"
          checked={localOption.required || false}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, required: checked }))}
        />
        <label htmlFor="required">Obrigatório</label>
      </div>
      <div className="flex justify-between">
        <Button type="submit">{extraOption.id ? 'Atualizar' : 'Adicionar'}</Button>
        {extraOption.id && (
          <Button type="button" variant="destructive" onClick={() => onDelete(extraOption.id)}>
            Excluir
          </Button>
        )}
      </div>
      <SelectionOptionsModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSave={handleSelectionOptionsSave}
        selectionOptions={selectionOptions}
        selectedOptions={localOption.selection_options || []}
      />
    </form>
  );
};

export default ExtraOptionForm;