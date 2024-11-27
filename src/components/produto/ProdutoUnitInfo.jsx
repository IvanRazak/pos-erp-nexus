import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProdutoUnitInfo = ({ editedProduto, handleChange, sheetPrices, handleSheetPriceChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="min-w-32">Tipo de Unidade:</label>
        <Select 
          name="unit_type" 
          value={editedProduto.unit_type} 
          onValueChange={(value) => handleChange({ target: { name: 'unit_type', value } })} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unit">Unidade</SelectItem>
            <SelectItem value="package">Pacote</SelectItem>
            <SelectItem value="square_meter">Metro Quadrado</SelectItem>
            <SelectItem value="sheets">Folhas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {editedProduto.unit_type === 'square_meter' && (
        <div className="flex items-center gap-4">
          <label className="min-w-32">Valor Mínimo:</label>
          <Input
            name="valor_minimo"
            type="number"
            value={editedProduto.valor_minimo || ''}
            onChange={handleChange}
            placeholder="Valor Mínimo"
            required
          />
        </div>
      )}

      {editedProduto.unit_type === 'sheets' && (
        <details>
          <summary className="cursor-pointer font-semibold mb-2">Tabela de Preços por Quantidade</summary>
          <div className="pl-4 space-y-2">
            {sheetPrices.map((price, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <label>Quantidade:</label>
                  <Input
                    type="number"
                    value={price.quantity}
                    onChange={(e) => handleSheetPriceChange(index, 'quantity', e.target.value)}
                    placeholder="Quantidade"
                    min="1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>Preço:</label>
                  <Input
                    type="number"
                    value={price.price}
                    onChange={(e) => handleSheetPriceChange(index, 'price', e.target.value)}
                    placeholder="Preço"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex items-center gap-4">
        <label className="min-w-32">Tipo de Produto:</label>
        <Select 
          name="type" 
          value={editedProduto.type} 
          onValueChange={(value) => handleChange({ target: { name: 'type', value } })} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Padrão</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProdutoUnitInfo;