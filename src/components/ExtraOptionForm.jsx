import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const ExtraOptionForm = ({ extraOption = {}, onSave, onDelete }) => {
  const [localOption, setLocalOption] = useState(extraOption);
  const [quantityPrices, setQuantityPrices] = useState(extraOption.quantityPrices || []);

  // Log para verificar se os dados estão sendo recebidos corretamente
  console.log("ExtraOption Recebida:", extraOption);
  console.log("Quantity Prices Recebidos:", extraOption.quantityPrices);

  // Atualiza os estados locais quando o extraOption mudar
  useEffect(() => {
    setLocalOption(extraOption);
    if (extraOption.quantityPrices) {
      setQuantityPrices(extraOption.quantityPrices);  // Preenche os valores de quantityPrices
      console.log("QuantityPrices atualizados:", extraOption.quantityPrices);
    }
  }, [extraOption]); // Dependência do extraOption

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuantityPriceChange = (index, field, value) => {
    const newQuantityPrices = [...quantityPrices];
    newQuantityPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setQuantityPrices(newQuantityPrices);
  };

  const addQuantityPrice = () => {
    setQuantityPrices([...quantityPrices, { quantity: 0, price: 0 }]);
  };

  const removeQuantityPrice = (index) => {
    setQuantityPrices(quantityPrices.filter((_, i) => i !== index));
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

      {localOption.use_quantity_pricing && (
        <ScrollArea className="h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quantityPrices.map((price, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.quantity} // Mostra a quantidade correta
                      onChange={(e) => handleQuantityPriceChange(index, 'quantity', e.target.value)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={price.price} // Mostra o preço correto
                      onChange={(e) => handleQuantityPriceChange(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" onClick={() => removeQuantityPrice(index)} variant="destructive">
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <Button type="button" onClick={addQuantityPrice}>
        Adicionar Nível de Preço
      </Button>
      
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
