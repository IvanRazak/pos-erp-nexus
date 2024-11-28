import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ProdutosTable = ({ produtos, extraOptions, onEdit, onDelete, isAdmin }) => {
  return (
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
          <TableHead>Tipo</TableHead>
          <TableHead>Opções Extras</TableHead>
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
            <TableCell>{produto.type}</TableCell>
            <TableCell>
              {produto.extra_options?.map(optionId => 
                extraOptions?.find(o => o.id === optionId)?.name
              ).join(', ')}
            </TableCell>
            <TableCell className="space-x-2">
              <Button onClick={() => onEdit(produto)} variant="outline">
                Editar
              </Button>
              {isAdmin && (
                <Button 
                  onClick={() => onDelete(produto.id)} 
                  variant="destructive"
                >
                  Excluir
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProdutosTable;