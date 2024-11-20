import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClienteForm from './ClienteForm';
import { toast } from "@/components/ui/use-toast";

const VendaHeader = ({
  setIsBuscarProdutoModalOpen,
  setClienteSelecionado,
  setIsBuscarClienteModalOpen,
  isNewClientDialogOpen,
  setIsNewClientDialogOpen,
  handleNewClientSuccess,
  clientes
}) => {
  const handleClienteSave = async (data) => {
    try {
      const savedClient = await handleNewClientSuccess(data);
      if (savedClient) {
        toast({
          title: "Cliente cadastrado com sucesso!",
          variant: "default",
        });
        setIsNewClientDialogOpen(false);
        if (savedClient.id) {
          setClienteSelecionado(savedClient.id);
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <div className="flex items-center space-x-2">
          <Select onValueChange={setClienteSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>{cliente.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsBuscarClienteModalOpen(true)}>
            Buscar Cliente
          </Button>
        </div>
        <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-2">Cadastrar Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastro de Cliente</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <ClienteForm onSave={handleClienteSave} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendaHeader;