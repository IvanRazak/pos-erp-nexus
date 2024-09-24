import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { validateCPF, validateCNPJ, validatePhone } from '../utils/validations';
import { fetchAddressByCEP } from '../utils/api';

const ClienteForm = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Aqui você implementaria a lógica para salvar o cliente
    console.log(data);
    setIsLoading(false);
  };

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

  const handleWhatsAppWebhook = () => {
    // Implementar lógica para enviar webhook
    console.log("Enviando webhook para WhatsApp");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("nome", { required: "Nome é obrigatório" })}
        placeholder="Nome"
      />
      {errors.nome && <span className="text-red-500">{errors.nome.message}</span>}

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
        {...register("telefone", { 
          required: "Telefone é obrigatório",
          validate: validatePhone
        })}
        placeholder="Telefone"
      />
      {errors.telefone && <span className="text-red-500">{errors.telefone.message}</span>}

      <div className="flex space-x-2">
        <Input
          {...register("whatsapp", { 
            required: "WhatsApp é obrigatório",
            validate: validatePhone
          })}
          placeholder="WhatsApp"
        />
        <Button type="button" onClick={handleWhatsAppWebhook}>Enviar Webhook</Button>
      </div>
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

      <Select onValueChange={(value) => setValue("documento", value)}>
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

      <div className="flex items-center space-x-2">
        <Switch {...register("bloqueado")} id="bloqueado" />
        <label htmlFor="bloqueado">Bloquear cliente</label>
      </div>

      <Select {...register("tipo")} defaultValue="comum">
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="comum">Cliente Comum</SelectItem>
          <SelectItem value="revendedor">Revendedor</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Cliente"}
      </Button>
    </form>
  );
};

export default ClienteForm;