import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { supabase } from '../lib/supabase';
import EditProdutoModal from './EditProdutoModal';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useSupabaseAuth() || {};
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  const { data: produtos, isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoProduto = Object.fromEntries(formData.entries());
    addProduct.mutate(novoProduto, {
      onSuccess: () => {
        toast({
          title: "Produto cadastrado com sucesso!",
          description: "O novo produto foi adicionado à lista.",
        });
        setIsDialogOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Erro ao cadastrar produto",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleOpenEditModal = (produto) => {
    setEditingProduto(produto);
  };

  const handleCloseEditModal = () => {
    setEditingProduto(null);
  };

  const handleDeleteProduct = (id) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Produto excluído com sucesso!",
          description: "O produto foi removido da lista.",
        });
      },
      onError: (error) => {
        toast({
          title: "Erro ao excluir produto",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Produtos</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Cadastrar Novo Produto</Button>
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
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos?.map((produto) => (
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
              <TableCell>
                <Button onClick={() => handleOpenEditModal(produto)} className="mr-2">Editar</Button>
                {isAdmin && (
                  <Button onClick={() => handleDeleteProduct(produto.id)} variant="destructive">Excluir</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingProduto && (
        <EditProdutoModal produto={editingProduto} onClose={handleCloseEditModal} onUpdate={updateProduct.mutate} />
      )}
    </div>
  );
};

export default Produtos;