import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarDimensoes, formatarM2 } from '../../utils/pedidoUtils';

const PedidoDetalhesTable = ({ itensPedido, renderExtras }) => {
  const calcularSubtotalItem = (item) => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras.reduce((sum, extra) => {
      const extraValue = extra.total_value || 0;
      if (extra.extra_option.fixed_value) {
        return sum + extraValue;
      }
      return sum + (extraValue * item.quantity);
    }, 0);
    return subtotalProduto + subtotalExtras - (item.discount || 0);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Produto</TableHead>
          <TableHead className="whitespace-nowrap">Quantidade</TableHead>
          <TableHead className="whitespace-nowrap">Valor Unitário</TableHead>
          <TableHead className="whitespace-nowrap">Opções Extras</TableHead>
          <TableHead className="whitespace-nowrap">Dimensões</TableHead>
          <TableHead className="whitespace-nowrap">M²</TableHead>
          <TableHead className="whitespace-nowrap">Descrição</TableHead>
          <TableHead className="whitespace-nowrap">Arte</TableHead>
          <TableHead className="whitespace-nowrap">Desconto Individual</TableHead>
          <TableHead className="whitespace-nowrap">Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itensPedido?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="whitespace-nowrap">{item.product.name}</TableCell>
            <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
            <TableCell className="whitespace-nowrap">R$ {item.unit_price.toFixed(2)}</TableCell>
            <TableCell className="whitespace-nowrap">{renderExtras(item.extras, item.quantity)}</TableCell>
            <TableCell className="whitespace-nowrap">{formatarDimensoes(item)}</TableCell>
            <TableCell className="whitespace-nowrap">{formatarM2(item)}</TableCell>
            <TableCell className="whitespace-nowrap">{item.description || 'N/A'}</TableCell>
            <TableCell className="whitespace-nowrap">{item.arte_option || 'N/A'}</TableCell>
            <TableCell className="whitespace-nowrap">R$ {(item.discount || 0).toFixed(2)}</TableCell>
            <TableCell className="whitespace-nowrap">R$ {calcularSubtotalItem(item).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PedidoDetalhesTable;