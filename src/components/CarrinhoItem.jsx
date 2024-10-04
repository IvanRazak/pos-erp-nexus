import React from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

const CarrinhoItem = ({ item, onDelete, onEdit }) => {
  return (
    <TableRow>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.quantidade}</TableCell>
      <TableCell>{item.largura && item.altura ? `${item.largura}m x ${item.altura}m` : 'N/A'}</TableCell>
      <TableCell>{item.m2 ? `${item.m2.toFixed(2)}m²` : 'N/A'}</TableCell>
      <TableCell>R$ {item.sale_price.toFixed(2)}</TableCell>
      <TableCell>{item.extras.map((extra, i) => <div key={i}>{extra.name}: R$ {extra.price.toFixed(2)}</div>)}</TableCell>
      <TableCell>R$ {item.total.toFixed(2)}</TableCell>
      <TableCell>
        <Button onClick={() => onEdit(item)} className="mr-2">Editar</Button>
        <Button onClick={() => onDelete(item)} variant="destructive">Excluir</Button>
      </TableCell>
    </TableRow>
  );
};

export default CarrinhoItem;