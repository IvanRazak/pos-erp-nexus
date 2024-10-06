import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ProdutoForm = ({ onSubmit, extraOptions, initialValues = {} }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoProduto = Object.fromEntries(formData.entries());
    
    // Convert extra_options to an array of UUIDs
    novoProduto.extra_options = Array.from(formData.getAll('extra_options'));
    
    // Set a default type if not provided
    if (!novoProduto.type) {
      novoProduto.type = 'standard';
    }
    
    onSubmit(novoProduto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Nome do Produto" required defaultValue={initialValues.name} />
      <Input name="sale_price" type="number" placeholder="Preço de Venda" required defaultValue={initialValues.sale_price} />
      <Input name="cost_price" type="number" placeholder="Preço de Custo" required defaultValue={initialValues.cost_price} />
      <Input name="description" placeholder="Descrição" required defaultValue={initialValues.description} />
      <Input name="number_of_copies" type="number" placeholder="Quantidade de Vias" required defaultValue={initialValues.number_of_copies} />
      <Input name="colors" placeholder="Cores" required defaultValue={initialValues.colors} />
      <Input name="format" placeholder="Formato" required defaultValue={initialValues.format} />
      <Select name="print_type" required defaultValue={initialValues.print_type}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Impressão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="front">Frente</SelectItem>
          <SelectItem value="front_and_back">Frente e Verso</SelectItem>
        </SelectContent>
      </Select>
      <Select name="unit_type" required defaultValue={initialValues.unit_type}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Unidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unit">Unidade</SelectItem>
          <SelectItem value="package">Pacote</SelectItem>
          <SelectItem value="square_meter">Metro Quadrado</SelectItem>
        </SelectContent>
      </Select>
      <Select name="type" required defaultValue={initialValues.type}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Padrão</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      <div>
        <h4 className="mb-2">Opções Extras</h4>
        {extraOptions?.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`extra-${option.id}`}
              name="extra_options"
              value={option.id}
              defaultChecked={initialValues.extra_options?.includes(option.id)}
            />
            <label htmlFor={`extra-${option.id}`}>
              {option.name} - R$ {option.price.toFixed(2)}
            </label>
          </div>
        ))}
      </div>
      <Button type="submit">Cadastrar</Button>
    </form>
  );
};

export default ProdutoForm;