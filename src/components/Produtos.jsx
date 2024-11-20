import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import EditProdutoModal from './EditProdutoModal';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useExtraOptions } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import ProdutoForm from './ProdutoForm';
import ProdutosTable from './ProdutosTable';

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const { toast } = useToast();
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
  const { data: extraOptions } = useExtraOptions();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSubmit = (novoProduto) => {
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
          <ProdutoForm onSubmit={handleSubmit} extraOptions={extraOptions} />
        </DialogContent>
      </Dialog>
      <ProdutosTable 
        produtos={produtos}
        extraOptions={extraOptions}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProduct}
        isAdmin={isAdmin}
      />
      {editingProduto && (
        <EditProdutoModal 
          produto={editingProduto} 
          onClose={handleCloseEditModal} 
          extraOptions={extraOptions}
        />
      )}
    </div>
  );
};

export default Produtos;