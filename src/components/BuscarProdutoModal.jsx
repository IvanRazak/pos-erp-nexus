import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts } from '../integrations/supabase';

const BuscarProdutoModal = ({ isOpen, onClose, onSelectProduto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: produtos } = useProducts();

  const filteredProdutos = produtos?.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Button onClick={() => onSelectProduto(produto)}>Selecionar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default BuscarProdutoModal;