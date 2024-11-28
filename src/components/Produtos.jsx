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
import PageSizeSelector from './ui/page-size-selector';

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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

  const handleDeleteProduct = (id) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Produto excluído com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao excluir produto: " + error.message);
      }
    });
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const paginatedProdutos = produtos ? produtos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : [];

  const totalPages = produtos ? Math.ceil(produtos.length / itemsPerPage) : 0;

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
        produtos={paginatedProdutos}
        extraOptions={extraOptions}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProduct}
        isAdmin={user?.isAdmin}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, produtos?.length || 0)} a {Math.min(currentPage * itemsPerPage, produtos?.length || 0)} de {produtos?.length || 0} produtos
          </div>
          <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Anterior
          </Button>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Próximo
          </Button>
        </div>
      </div>
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