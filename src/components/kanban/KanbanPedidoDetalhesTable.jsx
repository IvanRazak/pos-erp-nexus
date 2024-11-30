import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarDimensoes } from '../../utils/pedidoUtils';

const KanbanPedidoDetalhesTable = ({ itensPedido }) => {
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
            <TableCell className="whitespace-nowrap">
              {item.extras?.map((extra) => (
                <div key={extra.id}>
                  {extra.extra_option.name}
                  {extra.selected_option ? `: ${extra.selected_option.name}` : ''}
                </div>
              ))}
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatarDimensoes(item)}</TableCell>
            <TableCell className="whitespace-nowrap">{item.description || 'N/A'}</TableCell>
            <TableCell className="whitespace-nowrap">{item.arte_option || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KanbanPedidoDetalhesTable;