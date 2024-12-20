import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClienteForm from './ClienteForm';
import { toast } from "sonner";
import { useAddCustomer } from '../integrations/supabase';

const VendaHeader = ({
  setIsBuscarProdutoModalOpen,
  setClienteSelecionado,
  setIsBuscarClienteModalOpen,
  isNewClientDialogOpen,
  setIsNewClientDialogOpen,
  handleNewClientSuccess,
  clientes,
  clienteSelecionado
}) => {
  const addCustomer = useAddCustomer();

  const handleClienteSave = async (clienteData) => {
    try {
      const result = await addCustomer.mutateAsync(clienteData);
      
      if (!result?.data) {
        throw new Error('Salvo com sucesso*');
      }

      const savedClient = result.data[0];
      
      if (savedClient?.id) {
        toast.success("Cliente cadastrado com sucesso!");
        setIsNewClientDialogOpen(false);
        setClienteSelecionado(savedClient.id);
        
        if (handleNewClientSuccess) {
          handleNewClientSuccess(savedClient);
        }
      } else {
        throw new Error('Erro ao salvar cliente: ID não retornado');
      }
    } catch (error) {
      toast.error("*" + (error.message || 'Erro desconhecido'));
    }
  };

  const selectedClientName = clientes?.find(cliente => cliente.id === clienteSelecionado)?.name;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
        <Button onClick={() => setIsBuscarProdutoModalOpen(true)}>
          Buscar Produto
        </Button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Selecionar Cliente</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setIsBuscarClienteModalOpen(true)}>
            Buscar Cliente
          </Button>
          <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
            <DialogTrigger asChild>
              <Button>Cadastrar Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastro de Cliente</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[500px] pr-4">
                <ClienteForm onSave={handleClienteSave} showBlockOption={false} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        {selectedClientName && (
          <div className="text-sm font-medium text-gray-700 mt-2">
            Cliente selecionado: {selectedClientName}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendaHeader;