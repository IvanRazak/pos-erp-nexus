import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const EditProdutoModal = ({ produto, onClose }) => {
  const [editedProduto, setEditedProduto] = useState(produto);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProdutoMutation = useMutation({
    mutationFn: async (updatedProduto) => {
      const { data, error } = await supabase
        .from('products')
        .update(updatedProduto)
        .eq('id', produto.id)
        .select();
      if (error) throw error;
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
    const { name, value } = e.target;
    setEditedProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProdutoMutation.mutate(editedProduto);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto: {produto.name}</DialogTitle>
        </DialogHeader>
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
            </SelectContent>
          </Select>
          <Button type="submit">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProdutoModal;