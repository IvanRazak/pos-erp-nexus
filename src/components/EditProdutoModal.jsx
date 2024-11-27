import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import ProdutoBasicInfo from './produto/ProdutoBasicInfo';
import ProdutoUnitInfo from './produto/ProdutoUnitInfo';
import ProdutoExtraOptions from './produto/ProdutoExtraOptions';

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
      const { sheet_prices, ...productData } = updatedProduto;
      const { data, error } = await supabase
        .from('products')
        .update(productData)
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
    const updatedProduto = { ...editedProduto, sheet_prices: sheetPrices };
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
            <ProdutoBasicInfo editedProduto={editedProduto} handleChange={handleChange} />
            <ProdutoUnitInfo 
              editedProduto={editedProduto} 
              handleChange={handleChange}
              sheetPrices={sheetPrices}
              handleSheetPriceChange={handleSheetPriceChange}
            />
            <ProdutoExtraOptions 
              editedProduto={editedProduto} 
              extraOptions={extraOptions} 
              handleChange={handleChange}
            />
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditProdutoModal;