import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ProdutoForm = ({ onSubmit, extraOptions, initialValues = {} }) => {
  const [productType, setProductType] = useState(initialValues.type || 'standard');
  const [unitType, setUnitType] = useState(initialValues.unit_type || 'unit');
  const [options, setOptions] = useState(initialValues.options || []);
  const [sheetPrices, setSheetPrices] = useState(initialValues.sheet_prices || [
    { quantity: 1, price: 0 },
    { quantity: 100, price: 0 },
    { quantity: 500, price: 0 },
    { quantity: 1000, price: 0 },
    { quantity: 5000, price: 0 },
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoProduto = Object.fromEntries(formData.entries());
    
    novoProduto.extra_options = Array.from(formData.getAll('extra_options'));
    
    if (productType === 'custom') {
      novoProduto.options = options;
    }
    
    if (unitType === 'square_meter') {
      novoProduto.valor_minimo = parseFloat(novoProduto.valor_minimo);
    }

    if (unitType === 'sheets') {
      novoProduto.sheet_prices = sheetPrices;
    }
    
    onSubmit(novoProduto);
  };

  const handleAddOption = () => {
    setOptions([...options, { name: '', price: 0 }]);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSheetPriceChange = (index, field, value) => {
    const newSheetPrices = [...sheetPrices];
    newSheetPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setSheetPrices(newSheetPrices);
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
      <Select name="unit_type" required value={unitType} onValueChange={(value) => setUnitType(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Unidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unit">Unidade</SelectItem>
          <SelectItem value="package">Pacote</SelectItem>
          <SelectItem value="square_meter">Metro Quadrado</SelectItem>
          <SelectItem value="sheets">Folhas</SelectItem>
        </SelectContent>
      </Select>
      {unitType === 'square_meter' && (
        <Input name="valor_minimo" type="number" placeholder="Valor Mínimo" required defaultValue={initialValues.valor_minimo} />
      )}
      {unitType === 'sheets' && (
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
              {sheetPrices.map((price, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.quantity}
                      onChange={(e) => handleSheetPriceChange(index, 'quantity', e.target.value)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.price}
                      onChange={(e) => handleSheetPriceChange(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Select name="type" required value={productType} onValueChange={setProductType}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Padrão</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {productType === 'custom' && (
        <div>
          <h4 className="mb-2">Opções do Produto</h4>
          {options.map((option, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <Input
                placeholder="Nome da Opção"
                value={option.name}
                onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Preço"
                value={option.price}
                onChange={(e) => handleOptionChange(index, 'price', parseFloat(e.target.value))}
              />
            </div>
          ))}
          <Button type="button" onClick={handleAddOption}>Adicionar Opção</Button>
        </div>
      )}
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