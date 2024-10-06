import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ExtraOptionForm = ({ extraOption, onSave, onOpenSelectOptions }) => {
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
      <Input
        name="name"
        value={localOption.name}
        onChange={handleChange}
        placeholder="Nome da opção extra"
        required
      />
      <Input
        name="price"
        type="number"
        step="0.01"
        value={localOption.price}
        onChange={handleChange}
        placeholder="Preço"
        required
      />
      <Select
        value={localOption.type}
        onValueChange={(value) => setLocalOption(prev => ({ ...prev, type: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="number">Número</SelectItem>
          <SelectItem value="select">Seleção</SelectItem>
        </SelectContent>
      </Select>
      {localOption.type === 'select' && (
        <Button type="button" onClick={onOpenSelectOptions}>
          Configurar Opções de Seleção
        </Button>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="editable_in_cart"
          name="editable_in_cart"
          checked={localOption.editable_in_cart}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, editable_in_cart: checked }))}
        />
        <label htmlFor="editable_in_cart">Editável no carrinho</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          name="required"
          checked={localOption.required}
          onCheckedChange={(checked) => setLocalOption(prev => ({ ...prev, required: checked }))}
        />
        <label htmlFor="required">Obrigatório</label>
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  );
};

export default ExtraOptionForm;