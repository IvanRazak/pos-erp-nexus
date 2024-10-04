import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts } from '../integrations/supabase';

const BuscarProdutoModal = ({ isOpen, onClose, onSelectProduto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [m2, setM2] = useState(0);
  const { data: produtos } = useProducts();

  const filteredProdutos = produtos?.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (produto) => {
    setSelectedProduct(produto);
    setQuantidade(1);
    setLargura('');
    setAltura('');
    setM2(0);
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      onSelectProduto({
        ...selectedProduct,
        quantidade,
        largura: parseFloat(largura) || 0,
        altura: parseFloat(altura) || 0,
        m2: parseFloat(m2) || 0
      });
      onClose();
    }
  };

  const updateM2 = (newLargura, newAltura) => {
    setM2((parseFloat(newLargura) * parseFloat(newAltura)).toFixed(2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Buscar Produto</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar por nome do produto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
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
        {selectedProduct && (
          <div className="mt-4 space-y-2">
            <Input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
            />
            {selectedProduct.unit_type === 'square_meter' && (
              <>
                <Input
                  type="number"
                  placeholder="Largura"
                  value={largura}
                  onChange={(e) => {
                    const newLargura = e.target.value;
                    setLargura(newLargura);
                    updateM2(newLargura, altura);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Altura"
                  value={altura}
                  onChange={(e) => {
                    const newAltura = e.target.value;
                    setAltura(newAltura);
                    updateM2(largura, newAltura);
                  }}
                />
                <Input
                  type="number"
                  placeholder="M²"
                  value={m2}
                  readOnly
                />
              </>
            )}
            <Button onClick={handleConfirm}>Confirmar Seleção</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuscarProdutoModal;