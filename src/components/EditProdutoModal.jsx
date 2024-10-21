import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const EditProdutoModal = ({ produto, onClose, extraOptions }) => {
  const [editedProduto, setEditedProduto] = useState(produto);
  const [sheetPrices, setSheetPrices] = useState([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setEditedProduto(produto);
    if (produto.unit_type === 'sheets') {
      fetchSheetPrices(produto.id);
    } else {
      setSheetPrices([
        { quantity: 1, price: 0 },
        { quantity: 100, price: 0 },
        { quantity: 500, price: 0 },
        { quantity: 1000, price: 0 },
        { quantity: 5000, price: 0 },
      ]);
    }
  }, [produto]);

  const fetchSheetPrices = async (productId) => {
    const { data, error } = await supabase
      .from('product_sheet_prices')
      .select('*')
      .eq('product_id', productId)
      .order('quantity', { ascending: true });

    if (error) {
      console.error('Error fetching sheet prices:', error);
      return;
    }

    if (data && data.length > 0) {
      setSheetPrices(data);
    } else {
      setSheetPrices([
        { quantity: 1, price: 0 },
        { quantity: 100, price: 0 },
        { quantity: 500, price: 0 },
        { quantity: 1000, price: 0 },
        { quantity: 5000, price: 0 },
      ]);
    }
  };

  const updateProdutoMutation = useMutation({
    mutationFn: async (updatedProduto) => {
      const { data, error } = await supabase
        .from('products')
        .update(updatedProduto)
        .eq('id', produto.id)
        .select();
      if (error) throw error;
      
      if (updatedProduto.unit_type === 'sheets') {
        await supabase.from('product_sheet_prices').delete().eq('product_id', produto.id);
        const sheetPricesData = sheetPrices.map(price => ({
          product_id: produto.id,
          quantity: price.quantity,
          price: price.price
        }));
        const { error: sheetPricesError } = await supabase.from('product_sheet_prices').insert(sheetPricesData);
        if (sheetPricesError) throw sheetPricesError;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      toast({
        title: "Produto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      onClose();
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const updatedExtraOptions = checked
        ? [...(editedProduto.extra_options || []), value]
        : (editedProduto.extra_options || []).filter(id => id !== value);
      setEditedProduto(prev => ({ ...prev, extra_options: updatedExtraOptions }));
    } else if (name === 'unit_type') {
      setEditedProduto(prev => ({ 
        ...prev, 
        [name]: value, 
        valor_minimo: value === 'square_meter' ? prev.valor_minimo || 0 : null 
      }));
      if (value === 'sheets') {
        fetchSheetPrices(produto.id);
      }
    } else {
      setEditedProduto(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSheetPriceChange = (index, field, value) => {
    const newSheetPrices = [...sheetPrices];
    newSheetPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setSheetPrices(newSheetPrices);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduto = { ...editedProduto };
    updateProdutoMutation.mutate(updatedProduto);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Editar Produto: {produto.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" value={editedProduto.name} onChange={handleChange} placeholder="Nome do Produto" required />
            <Input name="sale_price" type="number" value={editedProduto.sale_price} onChange={handleChange} placeholder="Preço de Venda" required />
            <Input name="cost_price" type="number" value={editedProduto.cost_price} onChange={handleChange} placeholder="Preço de Custo" required />
            <Input name="description" value={editedProduto.description} onChange={handleChange} placeholder="Descrição" required />
            <Input name="number_of_copies" type="number" value={editedProduto.number_of_copies} onChange={handleChange} placeholder="Quantidade de Vias" required />
            <Input name="colors" value={editedProduto.colors} onChange={handleChange} placeholder="Cores" required />
            <Input name="format" value={editedProduto.format} onChange={handleChange} placeholder="Formato" required />
            <Select name="print_type" value={editedProduto.print_type} onValueChange={(value) => handleChange({ target: { name: 'print_type', value } })} required>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Impressão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Frente</SelectItem>
                <SelectItem value="front_and_back">Frente e Verso</SelectItem>
              </SelectContent>
            </Select>
            <Select name="unit_type" value={editedProduto.unit_type} onValueChange={(value) => handleChange({ target: { name: 'unit_type', value } })} required>
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
            {editedProduto.unit_type === 'square_meter' && (
              <Input
                name="valor_minimo"
                type="number"
                value={editedProduto.valor_minimo || ''}
                onChange={handleChange}
                placeholder="Valor Mínimo"
                required
              />
            )}
            {editedProduto.unit_type === 'sheets' && (
              <details>
                <summary className="cursor-pointer font-semibold mb-2">Tabela de Preços por Quantidade</summary>
                <div className="pl-4 space-y-2">
                  {sheetPrices.map((price, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        type="number"
                        value={price.quantity}
                        onChange={(e) => handleSheetPriceChange(index, 'quantity', e.target.value)}
                        placeholder="Quantidade"
                        min="1"
                      />
                      <Input
                        type="number"
                        value={price.price}
                        onChange={(e) => handleSheetPriceChange(index, 'price', e.target.value)}
                        placeholder="Preço"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </details>
            )}
            <Select name="type" value={editedProduto.type} onValueChange={(value) => handleChange({ target: { name: 'type', value } })} required>
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
                    checked={(editedProduto.extra_options || []).includes(option.id)}
                    onCheckedChange={(checked) => handleChange({
                      target: { 
                        type: 'checkbox', 
                        name: 'extra_options', 
                        value: option.id, 
                        checked 
                      }
                    })}
                  />
                  <label htmlFor={`extra-${option.id}`}>
                    {option.name} - R$ {option.price?.toFixed(2) ?? 'N/A'}
                  </label>
                </div>
              ))}
            </div>
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditProdutoModal;