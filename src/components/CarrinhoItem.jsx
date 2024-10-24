import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getExtraOptionPrice } from '../utils/vendaUtils';

const CarrinhoItem = ({ 
  item, 
  onDelete, 
  onEdit, 
  onDescriptionChange, 
  onUnitPriceChange, 
  onQuantityChange,
  onDiscountChange 
}) => {
  const [editingUnitPrice, setEditingUnitPrice] = useState(false);
  const [tempUnitPrice, setTempUnitPrice] = useState(item.unitPrice);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantidade);
  const [extrasPrices, setExtrasPrices] = useState({});

  useEffect(() => {
    const updateExtrasPrices = async () => {
      const prices = {};
      for (const extra of item.extras) {
        prices[extra.id] = await getExtraOptionPrice(extra, item.quantidade);
      }
      setExtrasPrices(prices);
    };
    updateExtrasPrices();
  }, [item.quantidade, item.extras]);

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
    const extrasTotal = item.extras.reduce((sum, extra) => {
      const extraPrice = extrasPrices[extra.id] || extra.price || 0;
      if (extra.fixed_value) {
        return sum + extraPrice;
      }
      return sum + extraPrice * item.quantidade;
    }, 0);
    const subtotal = basePrice + extrasTotal;
    const discount = item.discount || 0;
    return subtotal - discount;
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
      <TableCell>{item.m2 ? `${item.m2.toFixed(2)}m²` : 'N/A'}</TableCell>
      <TableCell>
        {editingUnitPrice ? (
          <Input
            type="number"
            value={tempUnitPrice}
            onChange={(e) => setTempUnitPrice(e.target.value)}
            onBlur={handleUnitPriceEdit}
            className="w-24"
          />
        ) : (
          <span onClick={() => setEditingUnitPrice(true)} className="cursor-pointer">
            R$ {item.unitPrice.toFixed(2)}
          </span>
        )}
      </TableCell>
      <TableCell>
        {item.extras.map((extra, i) => (
          <div key={i}>
            {extra.name}: 
            {extra.type === 'select' 
              ? `${extra.selectedOptionName} - R$ ${(extrasPrices[extra.id] || extra.price || 0).toFixed(2)}`
              : extra.type === 'number' 
                ? `${extra.value} x R$ ${(extrasPrices[extra.id] || extra.price || 0).toFixed(2)}`
                : `R$ ${(extrasPrices[extra.id] || extra.price || 0).toFixed(2)}`
            }
          </div>
        ))}
      </TableCell>
      <TableCell>{item.arteOption || 'N/A'}</TableCell>
      <TableCell>
        <Input
          type="number"
          placeholder="Desconto"
          value={item.discount || ''}
          onChange={(e) => onDiscountChange(item, parseFloat(e.target.value) || 0)}
          className="w-24 mb-2"
        />
      </TableCell>
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