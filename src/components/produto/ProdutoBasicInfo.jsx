import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProdutoBasicInfo = ({ editedProduto, handleChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="min-w-32">Nome do Produto:</label>
        <Input 
          name="name" 
          value={editedProduto.name} 
          onChange={handleChange} 
          placeholder="Nome do Produto" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Preço de Venda:</label>
        <Input 
          name="sale_price" 
          type="number" 
          value={editedProduto.sale_price} 
          onChange={handleChange} 
          placeholder="Preço de Venda" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Preço de Custo:</label>
        <Input 
          name="cost_price" 
          type="number" 
          value={editedProduto.cost_price} 
          onChange={handleChange} 
          placeholder="Preço de Custo" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Descrição:</label>
        <Input 
          name="description" 
          value={editedProduto.description} 
          onChange={handleChange} 
          placeholder="Descrição" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Quantidade de Vias:</label>
        <Input 
          name="number_of_copies" 
          type="number" 
          value={editedProduto.number_of_copies} 
          onChange={handleChange} 
          placeholder="Quantidade de Vias" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Cores:</label>
        <Input 
          name="colors" 
          value={editedProduto.colors} 
          onChange={handleChange} 
          placeholder="Cores" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Formato:</label>
        <Input 
          name="format" 
          value={editedProduto.format} 
          onChange={handleChange} 
          placeholder="Formato" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="min-w-32">Tipo de Impressão:</label>
        <Select 
          name="print_type" 
          value={editedProduto.print_type} 
          onValueChange={(value) => handleChange({ target: { name: 'print_type', value } })} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Impressão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="front">Frente</SelectItem>
            <SelectItem value="front_and_back">Frente e Verso</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProdutoBasicInfo;