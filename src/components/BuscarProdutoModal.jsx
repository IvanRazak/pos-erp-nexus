import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProducts } from '../integrations/supabase';

const BuscarProdutoModal = ({ isOpen, onClose, onSelectProduto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [altura, setAltura] = useState('');
  const [largura, setLargura] = useState('');
  const [m2, setM2] = useState(0);
  const { data: produtos } = useProducts();

  const filteredProdutos = produtos?.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (produto) => {
    setSelectedProduct(produto);
    setQuantidade(1);
    setAltura('');
    setLargura('');
    setM2(0);
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      const calculatedM2 = parseFloat(m2) || 0;
      let unitPrice = selectedProduct.sale_price;

      if (selectedProduct.unit_type === 'square_meter') {
        unitPrice = Math.max(selectedProduct.sale_price * calculatedM2, selectedProduct.valor_minimo || 0);
      } else if (selectedProduct.unit_type === 'sheets' && Array.isArray(selectedProduct.sheet_prices)) {
        // Encontrar o preço correto baseado na quantidade
        const sheetPrice = selectedProduct.sheet_prices.find(
          price => quantidade >= price.quantity
        );
        unitPrice = sheetPrice ? sheetPrice.price : selectedProduct.sale_price;
      }

      onSelectProduto({
        ...selectedProduct,
        quantidade,
        altura: parseFloat(altura) || 0,
        largura: parseFloat(largura) || 0,
        m2: calculatedM2,
        unitPrice: unitPrice
      });
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setQuantidade(1);
    setAltura('');
    setLargura('');
    setM2(0);
  };

  const updateM2 = (newAltura, newLargura) => {
    const calculatedM2 = (parseFloat(newAltura) * parseFloat(newLargura)).toFixed(2);
    setM2(calculatedM2);
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
        {selectedProduct && (
          <div className="mt-4 space-y-2 bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold">{selectedProduct.name}</h3>
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
                  placeholder="Altura"
                  value={altura}
                  onChange={(e) => {
                    const newAltura = e.target.value;
                    setAltura(newAltura);
                    updateM2(newAltura, largura);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Largura"
                  value={largura}
                  onChange={(e) => {
                    const newLargura = e.target.value;
                    setLargura(newLargura);
                    updateM2(altura, newLargura);
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancelar Seleção</Button>
              <Button onClick={handleConfirm}>Confirmar Seleção</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuscarProdutoModal;