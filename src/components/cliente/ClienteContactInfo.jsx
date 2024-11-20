import React from 'react';
import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { validatePhone } from '../../utils/validations';

const ClienteContactInfo = ({ register, errors, watch }) => {
  return (
    <div className="space-y-4">
      <div>
        <InputMask
          mask="(99)99999-9999"
          {...register("phone", { 
            required: "Telefone é obrigatório",
            validate: validatePhone
          })}
        >
          {(inputProps) => (
            <Input
              {...inputProps}
              placeholder="Telefone"
              type="tel"
            />
          )}
        </InputMask>
        {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
      </div>

      <div>
        <InputMask
          mask="(99)99999-9999"
          {...register("whatsapp", { 
            required: "WhatsApp é obrigatório",
            validate: validatePhone
          })}
        >
          {(inputProps) => (
            <Input
              {...inputProps}
              placeholder="WhatsApp"
              type="tel"
            />
          )}
        </InputMask>
        {errors.whatsapp && <span className="text-red-500">{errors.whatsapp.message}</span>}
      </div>

      <Input
        {...register("email", { 
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "E-mail inválido"
          }
        })}
        placeholder="E-mail"
        type="email"
      />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}
    </div>
  );
};

export default ClienteContactInfo;