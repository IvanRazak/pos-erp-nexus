import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

const ProdutoExtraOptions = ({ editedProduto, extraOptions, handleChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="mb-2">Opções Extras</h4>
      {extraOptions?.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`extra-${option.id}`}
            name="extra_options"
            value={option.id}
            checked={(editedProduto.extra_options || []).includes(option.id)}
            onCheckedChange={(checked) => handleChange({
              target: { 
                type: 'checkbox', 
                name: 'extra_options', 
                value: option.id, 
                checked 
              }
            })}
          />
          <label htmlFor={`extra-${option.id}`}>
            {option.name} - R$ {option.price?.toFixed(2) ?? 'N/A'}
          </label>
        </div>
      ))}
    </div>
  );
};

export default ProdutoExtraOptions;