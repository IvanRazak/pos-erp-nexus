import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputMask from 'react-input-mask';
import { validateCPF, validateCNPJ } from '../../utils/validations';

const ClienteDocumentInfo = ({ register, setValue, watch, errors }) => {
  return (
    <div className="space-y-4">
      <Select
        value={watch("documento") || "cpf"}
        onValueChange={(value) => setValue("documento", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Documento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cpf">CPF</SelectItem>
          <SelectItem value="cnpj">CNPJ</SelectItem>
        </SelectContent>
      </Select>

      {watch("documento") === "cpf" && (
        <div>
          <InputMask
            mask="999.999.999-99"
            {...register("cpf", { 
              required: "CPF é obrigatório",
              validate: validateCPF
            })}
          >
            {(inputProps) => (
              <Input
                {...inputProps}
                placeholder="CPF"
              />
            )}
          </InputMask>
          {errors.cpf && <span className="text-red-500">{errors.cpf.message}</span>}
        </div>
      )}

      {watch("documento") === "cnpj" && (
        <div>
          <InputMask
            mask="99.999.999/9999-99"
            {...register("cnpj", { 
              required: "CNPJ é obrigatório",
              validate: validateCNPJ
            })}
          >
            {(inputProps) => (
              <Input
                {...inputProps}
                placeholder="CNPJ"
              />
            )}
          </InputMask>
          {errors.cnpj && <span className="text-red-500">{errors.cnpj.message}</span>}
        </div>
      )}
    </div>
  );
};

export default ClienteDocumentInfo;