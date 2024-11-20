import React from 'react';
import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { fetchAddressByCEP } from '../../utils/api';

const ClienteAddressInfo = ({ register, setValue, errors }) => {
  const handleCEPBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      const address = await fetchAddressByCEP(cep);
      if (address) {
        setValue('endereco', address.logradouro);
        setValue('bairro', address.bairro);
        setValue('cidade', address.localidade);
        setValue('estado', address.uf);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <InputMask
          mask="99999-999"
          {...register("cep")}
          onBlur={handleCEPBlur}
        >
          {(inputProps) => (
            <Input
              {...inputProps}
              placeholder="CEP"
            />
          )}
        </InputMask>
      </div>

      <Input
        {...register("endereco", { required: "Endereço é obrigatório" })}
        placeholder="Endereço"
      />
      {errors.endereco && <span className="text-red-500">{errors.endereco.message}</span>}

      <Input
        {...register("numero", { required: "Número é obrigatório" })}
        placeholder="Número"
      />
      {errors.numero && <span className="text-red-500">{errors.numero.message}</span>}

      <Input {...register("complemento")} placeholder="Complemento" />
      <Input {...register("bairro")} placeholder="Bairro" />

      <Input
        {...register("cidade", { required: "Cidade é obrigatória" })}
        placeholder="Cidade"
      />
      {errors.cidade && <span className="text-red-500">{errors.cidade.message}</span>}

      <Input {...register("estado")} placeholder="Estado" />
    </div>
  );
};

export default ClienteAddressInfo;