import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import EditProdutoModal from './EditProdutoModal';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useExtraOptions } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import ProdutoForm from './ProdutoForm';
import ProdutosTable from './ProdutosTable';
import { toast } from "sonner";

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { session } = useSupabaseAuth();
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
        toast.success("Produto cadastrado com sucesso!");
        setIsDialogOpen(false);
      },
      onError: (error) => {
        toast.error("Erro ao cadastrar produto: " + error.message);
      }
    });
  };

  const handleOpenEditModal = (produto) => {
    setEditingProduto(produto);
  };

  const handleCloseEditModal = () => {
    setEditingProduto(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
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
        isAdmin={isAdmin}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalItems={produtos?.length || 0}
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