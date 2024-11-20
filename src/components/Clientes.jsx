import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClienteForm from './ClienteForm';
import ClienteList from './ClienteList';
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from '../integrations/supabase';
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { toast } from "sonner";
import { useAuth } from '../hooks/useAuth';

const Clientes = () => {
  const [activeTab, setActiveTab] = useState("lista");
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const { data: clientes, isLoading, error, refetch } = useCustomers();
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const { session } = useSupabaseAuth() || {};
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleSuccess = () => {
    refetch();
    setActiveTab("lista");
    setClienteEmEdicao(null);
  };

  const handleEdit = (cliente) => {
    setClienteEmEdicao(cliente);
    setActiveTab("cadastro");
  };

  const handleSave = async (clienteData) => {
    try {
      if (clienteEmEdicao) {
        await updateCustomer.mutateAsync({ id: clienteEmEdicao.id, ...clienteData });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await addCustomer.mutateAsync(clienteData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      handleSuccess();
    } catch (error) {
      toast.error(clienteEmEdicao ? "Erro ao atualizar cliente: " + error.message : "Erro ao cadastrar cliente: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success("Cliente excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir cliente: " + error.message);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar clientes: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Clientes</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="cadastro">
            {clienteEmEdicao ? 'Editar Cliente' : 'Cadastro de Cliente'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lista">
          <ClienteList 
            clientes={clientes} 
            onDelete={handleDelete}
            onEdit={handleEdit}
            isAdmin={session?.user?.role === 'admin'}
          />
        </TabsContent>
        <TabsContent value="cadastro">
          <ClienteForm 
            onSuccess={handleSuccess} 
            clienteInicial={clienteEmEdicao}
            onSave={handleSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clientes;
