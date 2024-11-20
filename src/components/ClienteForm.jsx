import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { validateCPF, validateCNPJ, validatePhone } from '../utils/validations';
import { fetchAddressByCEP } from '../utils/api';
import { useCustomerTypes } from '../integrations/supabase';
import InputMask from 'react-input-mask';

const ClienteForm = ({ onSave, clienteInicial }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      ...clienteInicial,
      bloqueado: clienteInicial?.bloqueado || false,
      customer_type_id: clienteInicial?.customer_type_id || ''
    }
  });
  const { data: customerTypes, isLoading: isLoadingCustomerTypes } = useCustomerTypes();

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

  const onSubmit = (data) => {
    try {
      // Ensure bloqueado is a boolean
      data.bloqueado = !!data.bloqueado;
      
      // Validate customer_type_id
      if (!data.customer_type_id) {
        throw new Error('Tipo de cliente é obrigatório');
      }

      // Ensure customer_type_id is properly set
      data.customer_type_id = String(data.customer_type_id);

      if (onSave) {
        onSave(data);
        // Only reset if save is successful
        reset();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      // Don't reset the form if there's an error
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
      )}
      {watch("documento") === "cnpj" && (
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
      )}
      {(errors.cpf || errors.cnpj) && <span className="text-red-500">{errors.cpf?.message || errors.cnpj?.message}</span>}

      <Textarea {...register("observacoes")} placeholder="Observações" />

      <div className="flex items-center space-x-2">
        <Switch
          id="bloqueado"
          checked={watch('bloqueado')}
          onCheckedChange={(checked) => setValue('bloqueado', checked)}
        />
        <label htmlFor="bloqueado">Bloquear cliente</label>
      </div>

      <Select 
        value={watch("customer_type_id")}
        onValueChange={(value) => setValue("customer_type_id", value)}
      >
        <SelectTrigger className={errors.customer_type_id ? "border-red-500" : ""}>
          <SelectValue placeholder="Tipo de Cliente" />
        </SelectTrigger>
        <SelectContent>
          {isLoadingCustomerTypes ? (
            <SelectItem value="loading">Carregando...</SelectItem>
          ) : (
            customerTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {errors.customer_type_id && <span className="text-red-500">Tipo de cliente é obrigatório</span>}

      <Button type="submit">{clienteInicial ? 'Atualizar Cliente' : 'Salvar Cliente'}</Button>
    </form>
  );
};

export default ClienteForm;