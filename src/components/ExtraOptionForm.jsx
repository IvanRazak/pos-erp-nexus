import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ExtraOptionForm = ({ extraOption = {}, onSave, onDelete, onOpenSelectOptions }) => {
  const [localOption, setLocalOption] = React.useState(extraOption);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localOption);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da opção extra</Label>
        <Input
          id="name"
          name="name"
          value={localOption.name || ''}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Preço</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={localOption.price || ''}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          id="type"
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
      </div>
      
      {localOption.type === 'select' && (
        <Button type="button" onClick={() => onOpenSelectOptions(localOption)}>
          Configurar Opções de Seleção
        </Button>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="editable_in_cart"
          name="editable_in_cart"
          checked={localOption.editable_in_cart || false}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, editable_in_cart: checked }))}
        />
        <Label htmlFor="editable_in_cart">Editável no carrinho</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          name="required"
          checked={localOption.required || false}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, required: checked }))}
        />
        <Label htmlFor="required">Obrigatório</Label>
      </div>
      
      <div className="flex justify-between">
        <Button type="submit">{extraOption.id ? 'Atualizar' : 'Adicionar'}</Button>
        {extraOption.id && (
          <Button type="button" variant="destructive" onClick={() => onDelete(extraOption.id)}>
            Excluir
          </Button>
        )}
      </div>
    </form>
  );
};

export default ExtraOptionForm;