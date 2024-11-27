import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import PageSizeSelector from "@/components/ui/page-size-selector";

const ProdutosTable = ({ 
  produtos, 
  extraOptions, 
  onEdit, 
  onDelete,
  isAdmin,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = produtos?.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <PageSizeSelector 
          pageSize={pageSize} 
          onPageSizeChange={onPageSizeChange} 
        />
      </div>
      
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
            {isAdmin && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentProducts?.map((produto) => (
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
              {isAdmin && (
                <TableCell>
                  <Button onClick={() => onEdit(produto)} variant="outline" size="sm">
                    Editar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default ProdutosTable;