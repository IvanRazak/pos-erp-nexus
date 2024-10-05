import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const EditProdutoModal = ({ produto, onClose, onUpdate, extraOptions, selectedExtras, setSelectedExtras }) => {
  const [editedProduto, setEditedProduto] = useState(produto);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleExtraOptionChange = (extraId) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...editedProduto, extra_options: selectedExtras });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto: {produto.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" value={editedProduto.name} onChange={handleChange} placeholder="Nome do Produto" required />
          <Input name="sale_price" type="number" value={editedProduto.sale_price} onChange={handleChange} placeholder="Preço de Venda" required />
          <Input name="cost_price" type="number" value={editedProduto.cost_price} onChange={handleChange} placeholder="Preço de Custo" required />
          <Input name="description" value={editedProduto.description} onChange={handleChange} placeholder="Descrição" required />
          <Input name="number_of_copies" type="number" value={editedProduto.number_of_copies} onChange={handleChange} placeholder="Quantidade de Vias" required />
          <Input name="colors" value={editedProduto.colors} onChange={handleChange} placeholder="Cores" required />
          <Input name="format" value={editedProduto.format} onChange={handleChange} placeholder="Formato" required />
          <Select name="print_type" value={editedProduto.print_type} onValueChange={(value) => handleChange({ target: { name: 'print_type', value } })} required>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Impressão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front">Frente</SelectItem>
              <SelectItem value="front_and_back">Frente e Verso</SelectItem>
            </SelectContent>
          </Select>
          <Select name="unit_type" value={editedProduto.unit_type} onValueChange={(value) => handleChange({ target: { name: 'unit_type', value } })} required>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unidade</SelectItem>
              <SelectItem value="package">Pacote</SelectItem>
              <SelectItem value="square_meter">Metro Quadrado</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <h4 className="font-semibold mb-2">Opções Extras</h4>
            {extraOptions?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`extra-${option.id}`}
                  checked={selectedExtras.includes(option.id)}
                  onCheckedChange={() => handleExtraOptionChange(option.id)}
                />
                <label htmlFor={`extra-${option.id}`}>{option.name}</label>
              </div>
            ))}
          </div>
          <Button type="submit">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProdutoModal;