import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '../lib/supabase';

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const cadastrarProdutoMutation = useMutation({
    mutationFn: async (novoProduto) => {
      const { data, error } = await supabase
        .from('products')
        .insert([novoProduto])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      toast({
        title: "Produto cadastrado com sucesso!",
        description: "O novo produto foi adicionado à lista.",
      });
      setIsDialogOpen(false);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoProduto = Object.fromEntries(formData.entries());
    cadastrarProdutoMutation.mutate(novoProduto);
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Produtos</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Cadastrar Novo Produto</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastro de Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Nome do Produto" required />
            <Input name="sale_price" type="number" placeholder="Preço de Venda" required />
            <Input name="cost_price" type="number" placeholder="Preço de Custo" required />
            <Input name="description" placeholder="Descrição" required />
            <Input name="number_of_copies" type="number" placeholder="Quantidade de Vias" required />
            <Input name="colors" placeholder="Cores" required />
            <Input name="format" placeholder="Formato" required />
            <Select name="print_type" required>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Impressão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Frente</SelectItem>
                <SelectItem value="front_and_back">Frente e Verso</SelectItem>
              </SelectContent>
            </Select>
            <Select name="unit_type" required>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit">Unidade</SelectItem>
                <SelectItem value="package">Pacote</SelectItem>
                <SelectItem value="square_meter">Metro Quadrado</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Cadastrar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço de Venda</TableHead>
            <TableHead>Preço de Custo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Quantidade de Vias</TableHead>
            <TableHead>Cores</TableHead>
            <TableHead>Formato</TableHead>
            <TableHead>Impressão</TableHead>
            <TableHead>Tipo de Unidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell>{produto.name}</TableCell>
              <TableCell>{produto.sale_price}</TableCell>
              <TableCell>{produto.cost_price}</TableCell>
              <TableCell>{produto.description}</TableCell>
              <TableCell>{produto.number_of_copies}</TableCell>
              <TableCell>{produto.colors}</TableCell>
              <TableCell>{produto.format}</TableCell>
              <TableCell>{produto.print_type}</TableCell>
              <TableCell>{produto.unit_type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Produtos;
