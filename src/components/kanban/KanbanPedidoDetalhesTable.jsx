import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const KanbanPedidoDetalhesTable = ({ itensPedido, renderExtras }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Produto</TableHead>
          <TableHead className="whitespace-nowrap">Quantidade</TableHead>
          <TableHead className="whitespace-nowrap">Opções Extras</TableHead>
          <TableHead className="whitespace-nowrap">Dimensões</TableHead>
          <TableHead className="whitespace-nowrap">Descrição</TableHead>
          <TableHead className="whitespace-nowrap">Arte</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itensPedido?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="whitespace-nowrap">{item.product.name}</TableCell>
            <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
            <TableCell className="whitespace-nowrap">{renderExtras(item.extras, item.quantity)}</TableCell>
            <TableCell className="whitespace-nowrap">
              {item.width && item.height ? `${item.width}m x ${item.height}m` : 'N/A'}
            </TableCell>
            <TableCell className="whitespace-nowrap">{item.description || 'N/A'}</TableCell>
            <TableCell className="whitespace-nowrap">{item.arte_option || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KanbanPedidoDetalhesTable;