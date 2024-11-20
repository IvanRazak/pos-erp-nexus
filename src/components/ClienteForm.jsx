import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCustomerTypes } from '../integrations/supabase';
import ClienteContactInfo from './cliente/ClienteContactInfo';
import ClienteAddressInfo from './cliente/ClienteAddressInfo';
import ClienteDocumentInfo from './cliente/ClienteDocumentInfo';

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

  const onSubmit = async (data) => {
    try {
      // Remove masks before saving
      if (data.phone) data.phone = data.phone.replace(/\D/g, '');
      if (data.whatsapp) data.whatsapp = data.whatsapp.replace(/\D/g, '');
      if (data.cpf) data.cpf = data.cpf.replace(/\D/g, '');
      if (data.cnpj) data.cnpj = data.cnpj.replace(/\D/g, '');
      if (data.cep) data.cep = data.cep.replace(/\D/g, '');

      // Ensure customer_type_id is properly set
      if (!data.customer_type_id) {
        toast.error("Tipo de cliente é obrigatório");
        return;
      }

      data.bloqueado = !!data.bloqueado;
      data.customer_type_id = String(data.customer_type_id);

      if (onSave) {
        await onSave(data);
        reset();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("name", { required: "Nome é obrigatório" })}
        placeholder="Nome"
      />
      {errors.name && <span className="text-red-500">{errors.name.message}</span>}

      <ClienteContactInfo register={register} errors={errors} watch={watch} />
      <ClienteAddressInfo register={register} setValue={setValue} errors={errors} />
      <ClienteDocumentInfo register={register} setValue={setValue} watch={watch} errors={errors} />

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

      <Textarea {...register("observacoes")} placeholder="Observações" />

      <div className="flex items-center space-x-2">
        <Switch
          id="bloqueado"
          checked={watch('bloqueado')}
          onCheckedChange={(checked) => setValue('bloqueado', checked)}
        />
        <label htmlFor="bloqueado">Bloquear cliente</label>
      </div>

      <Button type="submit">
        {clienteInicial ? 'Atualizar Cliente' : 'Salvar Cliente'}
      </Button>
    </form>
  );
};

export default ClienteForm;