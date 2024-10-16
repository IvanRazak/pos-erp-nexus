import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const CarrinhoItem = ({ item, onDelete, onEdit, onDescriptionChange, onUnitPriceChange, onQuantityChange }) => {
  const [editingUnitPrice, setEditingUnitPrice] = useState(false);
  const [tempUnitPrice, setTempUnitPrice] = useState(item.unitPrice);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantidade);

  const handleUnitPriceEdit = () => {
    if (editingUnitPrice) {
      onUnitPriceChange(item, parseFloat(tempUnitPrice));
    }
    setEditingUnitPrice(!editingUnitPrice);
  };

  const handleQuantityEdit = () => {
    if (editingQuantity) {
      onQuantityChange(item, parseInt(tempQuantity, 10));
    }
    setEditingQuantity(!editingQuantity);
  };

  return (
    <TableRow>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        {editingQuantity ? (
          <Input
            type="number"
            value={tempQuantity}
            onChange={(e) => setTempQuantity(e.target.value)}
            onBlur={handleQuantityEdit}
            className="w-20"
          />
        ) : (
          <span onClick={() => setEditingQuantity(true)} className="cursor-pointer">
            {item.quantidade}
          </span>
        )}
      </TableCell>
      <TableCell>{item.largura && item.altura ? `${item.largura}m x ${item.altura}m` : 'N/A'}</TableCell>
      <TableCell>{item.arteOption ? (item.arteOption === 'mesma_arte' ? 'Mesma Arte' : 'Arte Diferente') : 'N/A'}</TableCell>
      <TableCell>{item.m2 ? `${item.m2.toFixed(2)}m²` : 'N/A'}</TableCell>
      <TableCell>
        {item.unit_type === 'square_meter' ? (
          editingUnitPrice ? (
            <Input
              type="number"
              value={tempUnitPrice}
              onChange={(e) => setTempUnitPrice(e.target.value)}
              onBlur={handleUnitPriceEdit}
              className="w-24"
            />
          ) : (
            <span onClick={handleUnitPriceEdit} className="cursor-pointer">
              R$ {item.unitPrice.toFixed(2)}
            </span>
          )
        ) : (
          `R$ ${item.unitPrice.toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        {item.extras.map((extra, i) => (
          <div key={i}>
            {extra.name}: 
            {extra.type === 'select' 
              ? `${extra.selectedOptionName} - R$ ${extra.totalPrice.toFixed(2)}`
              : extra.type === 'number' 
                ? `${extra.value} x R$ ${extra.price.toFixed(2)} = R$ ${extra.totalPrice.toFixed(2)}`
                : `R$ ${extra.totalPrice.toFixed(2)}`
            }
          </div>
        ))}
      </TableCell>
      <TableCell>R$ {item.total.toFixed(2)}</TableCell>
      <TableCell>
        <Input
          type="text"
          placeholder="Descrição"
          value={item.description || ''}
          onChange={(e) => onDescriptionChange(item, e.target.value)}
          className="mb-2"
        />
        <Button onClick={() => onEdit(item)} className="mr-2">Editar</Button>
        <Button onClick={() => onDelete(item)} variant="destructive">Excluir</Button>
      </TableCell>
    </TableRow>
  );
};

export default CarrinhoItem;
