import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { validateCPF, validateCNPJ, validatePhone } from '../utils/validations';
import { fetchAddressByCEP } from '../utils/api';

const ClienteForm = ({ onSave, clienteInicial }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: clienteInicial || {}
  });

  useEffect(() => {
    if (clienteInicial) {
      Object.keys(clienteInicial).forEach(key => {
        setValue(key, clienteInicial[key]);
      });
    }
  }, [clienteInicial, setValue]);

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

  const onSubmit = async (data) => {
    if (onSave) {
      try {
        await onSave(data);
        reset();
      } catch (error) {
        console.error("Erro ao salvar formulário:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("name", { required: "Nome é obrigatório" })}
        placeholder="Nome"
      />
      {errors.name && <span className="text-red-500">{errors.name.message}</span>}

      <Input
        {...register("email", { 
          required: "E-mail é obrigatório",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "E-mail inválido"
          }
        })}
        placeholder="E-mail"
        type="email"
      />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <Input
        {...register("phone", { 
          required: "Telefone é obrigatório",
          validate: validatePhone
        })}
        placeholder="Telefone"
      />
      {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}

      <Input
        {...register("whatsapp", { 
          required: "WhatsApp é obrigatório",
          validate: validatePhone
        })}
        placeholder="WhatsApp"
      />
      {errors.whatsapp && <span className="text-red-500">{errors.whatsapp.message}</span>}

      <Input
        {...register("cep", { required: "CEP é obrigatório" })}
        placeholder="CEP"
        onBlur={handleCEPBlur}
      />
      {errors.cep && <span className="text-red-500">{errors.cep.message}</span>}

      <Input {...register("endereco")} placeholder="Endereço" />
      <Input {...register("numero")} placeholder="Número" />
      <Input {...register("complemento")} placeholder="Complemento" />
      <Input {...register("bairro")} placeholder="Bairro" />
      <Input {...register("cidade")} placeholder="Cidade" />
      <Input {...register("estado")} placeholder="Estado" />

      <Select onValueChange={(value) => setValue("documento", value)} defaultValue={watch("documento")}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Documento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cpf">CPF</SelectItem>
          <SelectItem value="cnpj">CNPJ</SelectItem>
        </SelectContent>
      </Select>

      {watch("documento") === "cpf" && (
        <Input
          {...register("cpf", { 
            required: "CPF é obrigatório",
            validate: validateCPF
          })}
          placeholder="CPF"
        />
      )}
      {watch("documento") === "cnpj" && (
        <Input
          {...register("cnpj", { 
            required: "CNPJ é obrigatório",
            validate: validateCNPJ
          })}
          placeholder="CNPJ"
        />
      )}
      {(errors.cpf || errors.cnpj) && <span className="text-red-500">{errors.cpf?.message || errors.cnpj?.message}</span>}

      <Textarea {...register("observacoes")} placeholder="Observações" />

      <Button type="submit">{clienteInicial ? 'Atualizar Cliente' : 'Salvar Cliente'}</Button>
    </form>
  );
};

export default ClienteForm;