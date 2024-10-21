import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const QuantityPricesModal = ({ isOpen, onClose, quantityPrices, onSave }) => {
  const [localPrices, setLocalPrices] = useState(quantityPrices);

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...localPrices];
    newPrices[index][field] = field === 'quantity' ? parseInt(value, 10) : parseFloat(value);
    setLocalPrices(newPrices);
  };

  const handleAddPrice = () => {
    setLocalPrices([...localPrices, { quantity: 0, price: 0 }]);
  };

  const handleRemovePrice = (index) => {
    setLocalPrices(localPrices.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localPrices);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Preços por Quantidade</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantidade</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localPrices.map((price, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="number"
                    value={price.quantity}
                    onChange={(e) => handlePriceChange(index, 'quantity', e.target.value)}
                    min="1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={price.price}
                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleRemovePrice(index)} variant="destructive" size="sm">
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={handleAddPrice}>Adicionar Nível de Preço</Button>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityPricesModal;