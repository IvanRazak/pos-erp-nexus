import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClienteForm from './ClienteForm';
import ClienteList from './ClienteList';
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from '../integrations/supabase';
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { toast } from "@/components/ui/use-toast";
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
        toast({
          title: "Cliente atualizado com sucesso!",
          description: "As informações do cliente foram atualizadas.",
        });
      } else {
        await addCustomer.mutateAsync(clienteData);
        toast({
          title: "Cliente cadastrado com sucesso!",
          description: "O novo cliente foi adicionado à lista.",
        });
      }
      handleSuccess();
    } catch (error) {
      toast({
        title: clienteEmEdicao ? "Erro ao atualizar cliente" : "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast({
        title: "Cliente excluído com sucesso!",
        description: "O cliente foi removido da lista.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
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
