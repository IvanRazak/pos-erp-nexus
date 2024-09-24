import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClienteForm from './ClienteForm';
import ClienteList from './ClienteList';
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from '../integrations/supabase';

const Clientes = () => {
  const [activeTab, setActiveTab] = useState("lista");
  const { data: clientes, isLoading, error } = useCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar clientes: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Clientes</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro de Cliente</TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <ClienteList 
            clientes={clientes} 
            onDelete={deleteCustomer.mutate}
            onUpdate={updateCustomer.mutate}
          />
        </TabsContent>
        <TabsContent value="cadastro">
          <ClienteForm onSubmit={addCustomer.mutate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clientes;
