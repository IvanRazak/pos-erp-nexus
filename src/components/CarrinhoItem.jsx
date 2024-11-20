import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getSheetPrice } from '../utils/productUtils';

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
      const newQuantity = parseInt(tempQuantity, 10);
      if (newQuantity !== item.quantidade) {
        onQuantityChange(item, newQuantity);
      }
    }
    setEditingQuantity(!editingQuantity);
  };

  const calculateItemTotal = () => {
    const basePrice = item.unitPrice * item.quantidade;
    const extrasTotal = item.extras?.reduce((sum, extra) => sum + (extra.totalPrice || 0), 0) || 0;
    return basePrice + extrasTotal * item.quantidade;
  };

  const renderExtras = () => {
    if (!item.extras || item.extras.length === 0) return 'Nenhuma';

    return item.extras.map((extra, index) => (
      <div key={index} className="text-sm">
        {extra.name}: 
        {extra.type === 'select' 
          ? ` ${extra.selectedOptionName} - R$ ${extra.totalPrice?.toFixed(2)}`
          : extra.type === 'number'
            ? ` ${extra.value} x R$ ${extra.price?.toFixed(2)} = R$ ${extra.totalPrice?.toFixed(2)}`
            : ` R$ ${extra.totalPrice?.toFixed(2)}`
        }
      </div>
    ));
  };

  useEffect(() => {
    const updateSheetPrice = async () => {
      if (item.unit_type === 'sheets') {
        const newPrice = await getSheetPrice(item.id, item.quantidade);
        if (newPrice && newPrice !== item.unitPrice) {
          onUnitPriceChange(item, newPrice);
        }
      }
    };

    updateSheetPrice();
  }, [item.quantidade]);

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
      <TableCell>{item.largura && item.altura ? `${item.largura}m (L) x ${item.altura}m (A)` : 'N/A'}</TableCell>
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
      <TableCell>{renderExtras()}</TableCell>
      <TableCell>{item.arteOption || 'N/A'}</TableCell>
      <TableCell>R$ {calculateItemTotal().toFixed(2)}</TableCell>
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
