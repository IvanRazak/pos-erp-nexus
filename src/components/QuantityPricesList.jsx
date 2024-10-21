import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const QuantityPricesList = ({ quantityPrices, onQuantityPriceChange, onAddQuantityPrice, onRemoveQuantityPrice }) => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quantidade</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quantityPrices.map((price, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="number"
                  value={price.quantity}
                  onChange={(e) => onQuantityPriceChange(index, 'quantity', parseInt(e.target.value, 10))}
                  min="1"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={price.price}
                  onChange={(e) => onQuantityPriceChange(index, 'price', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <Button onClick={() => onRemoveQuantityPrice(index)} variant="destructive">
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onAddQuantityPrice}>Adicionar Nível de Preço</Button>
    </div>
  );
};

export default QuantityPricesList;