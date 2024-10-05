import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProducts } from '../integrations/supabase';
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';

const BuscarProdutoModal = ({ isOpen, onClose, onSelectProduto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const { data: produtos } = useProducts();

  const filteredProdutos = produtos?.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (produto) => {
    setSelectedProduct(produto);
    setShowExtraOptions(true);
  };

  const handleConfirmWithExtras = (produtoComExtras) => {
    onSelectProduto(produtoComExtras);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Produto</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar por nome do produto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="flex-grow h-[40vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos?.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.name}</TableCell>
                  <TableCell>R$ {produto.sale_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleProductSelect(produto)}>Selecionar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
      {showExtraOptions && selectedProduct && (
        <ProdutoExtraOptionsModal
          produto={selectedProduct}
          onClose={() => setShowExtraOptions(false)}
          onConfirm={handleConfirmWithExtras}
        />
      )}
    </Dialog>
  );
};

export default BuscarProdutoModal;