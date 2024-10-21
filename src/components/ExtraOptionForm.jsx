import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectionOptionsModal from './SelectionOptionsModal';
import { useSelectionOptions } from '../integrations/supabase';

const ExtraOptionForm = ({ extraOption = {}, onSave, onDelete }) => {
  const [localOption, setLocalOption] = useState(extraOption);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const { data: selectionOptions } = useSelectionOptions();
  const [quantityPrices, setQuantityPrices] = useState([
    { quantity: 1, price: 0 },
    { quantity: 100, price: 0 },
    { quantity: 500, price: 0 },
    { quantity: 1000, price: 0 },
    { quantity: 5000, price: 0 },
  ]);

  useEffect(() => {
    if (extraOption.id) {
      // Fetch quantity prices if they exist
      fetchQuantityPrices(extraOption.id);
    }
  }, [extraOption.id]);

  const fetchQuantityPrices = async (extraOptionId) => {
    // Implement this function to fetch quantity prices from the database
    // and update the quantityPrices state
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...localOption, quantityPrices: localOption.use_quantity_pricing ? quantityPrices : null });
  };

  const handleSelectionOptionsSave = (selectedOptions) => {
    setLocalOption(prev => ({ ...prev, selection_options: selectedOptions }));
  };

  const handleQuantityPriceChange = (index, field, value) => {
    const newQuantityPrices = [...quantityPrices];
    newQuantityPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setQuantityPrices(newQuantityPrices);
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
      {localOption.type !== 'select' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use_quantity_pricing"
              name="use_quantity_pricing"
              checked={localOption.use_quantity_pricing || false}
              onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, use_quantity_pricing: checked }))}
            />
            <label htmlFor="use_quantity_pricing">Usar preços por quantidade</label>
          </div>
          {localOption.use_quantity_pricing ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quantityPrices.map((price, index) => (
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
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Input
              name="price"
              type="number"
              step="0.01"
              value={localOption.price || ''}
              onChange={handleChange}
              placeholder="Preço"
              required
            />
          )}
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