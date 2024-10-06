import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddPaymentOption, useAddCustomerType, useExtraOptions, useAddExtraOption, useUpdateExtraOption, useDeleteExtraOption, useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';
import SelectOptionsModal from './SelectOptionsModal';
import ExtraOptionForm from './ExtraOptionForm';
import UserManagementForm from './UserManagementForm';

const AdminMenu = () => {
  const [isExtraOptionsDialogOpen, setIsExtraOptionsDialogOpen] = useState(false);
  const [editingExtraOption, setEditingExtraOption] = useState(null);
  const [isSelectOptionsModalOpen, setIsSelectOptionsModalOpen] = useState(false);
  const [newExtraOption, setNewExtraOption] = useState({
    name: '',
    price: 0,
    type: 'number',
    options: [],
    editable_in_cart: false,
    required: false
  });

  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();
  const { data: extraOptions, refetch: refetchExtraOptions } = useExtraOptions();
  const addExtraOption = useAddExtraOption();
  const updateExtraOption = useUpdateExtraOption();
  const deleteExtraOption = useDeleteExtraOption();

  const handleCadastrarOpcaoPagamento = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('paymentOption');
    addPaymentOption.mutate({ name }, {
      onSuccess: () => {
        toast({ title: "Opção de pagamento cadastrada com sucesso!" });
        event.target.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao cadastrar opção de pagamento", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleCadastrarTipoCliente = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('customerType');
    addCustomerType.mutate({ name }, {
      onSuccess: () => {
        toast({ title: "Tipo de cliente cadastrado com sucesso!" });
        event.target.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao cadastrar tipo de cliente", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleAddOrUpdateExtraOption = async (extraOption) => {
    try {
      if (editingExtraOption) {
        await updateExtraOption.mutateAsync({ id: editingExtraOption.id, ...extraOption });
        toast({ title: "Opção extra atualizada com sucesso!" });
      } else {
        await addExtraOption.mutateAsync(extraOption);
        toast({ title: "Opção extra cadastrada com sucesso!" });
      }
      setEditingExtraOption(null);
      setNewExtraOption({
        name: '',
        price: 0,
        type: 'number',
        options: [],
        editable_in_cart: false,
        required: false
      });
      refetchExtraOptions();
    } catch (error) {
      toast({ title: "Erro ao salvar opção extra", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteExtraOption = async (id) => {
    try {
      await deleteExtraOption.mutateAsync(id);
      toast({ title: "Opção extra excluída com sucesso!" });
      refetchExtraOptions();
    } catch (error) {
      toast({ title: "Erro ao excluir opção extra", description: error.message, variant: "destructive" });
    }
  };

  const handleOpenSelectOptionsModal = (option) => {
    setEditingExtraOption(option);
    setIsSelectOptionsModalOpen(true);
  };

  const handleSaveSelectOptions = (options) => {
    if (editingExtraOption) {
      setEditingExtraOption({ ...editingExtraOption, options });
    } else {
      setNewExtraOption({ ...newExtraOption, options });
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Menu Administrativo</h3>
      <div className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Cadastrar Opção de Pagamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Opção de Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCadastrarOpcaoPagamento}>
              <Input name="paymentOption" placeholder="Nome da opção de pagamento" className="mb-4" />
              <Button type="submit">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Cadastrar Tipo de Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Tipo de Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCadastrarTipoCliente}>
              <Input name="customerType" placeholder="Nome do tipo de cliente" className="mb-4" />
              <Button type="submit">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Gerenciar Usuários</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Usuários</DialogTitle>
            </DialogHeader>
            <UserManagementForm />
          </DialogContent>
        </Dialog>

        <Dialog open={isExtraOptionsDialogOpen} onOpenChange={setIsExtraOptionsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Gerenciar Opções Extras</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Opções Extras</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h4 className="font-semibold">Adicionar Nova Opção Extra</h4>
              <ExtraOptionForm
                extraOption={newExtraOption}
                onSave={handleAddOrUpdateExtraOption}
                onOpenSelectOptions={() => handleOpenSelectOptionsModal(newExtraOption)}
              />
              
              <h4 className="font-semibold mt-6">Opções Extras Existentes</h4>
              {extraOptions?.map((option) => (
                <div key={option.id} className="border p-4 rounded">
                  <h5 className="font-semibold">{option.name}</h5>
                  <p>Preço: R$ {option.price.toFixed(2)}</p>
                  <p>Tipo: {option.type}</p>
                  {option.type === 'select' && <p>Opções: {option.options?.join(', ')}</p>}
                  <p>Editável no carrinho: {option.editable_in_cart ? 'Sim' : 'Não'}</p>
                  <p>Obrigatório: {option.required ? 'Sim' : 'Não'}</p>
                  <div className="mt-2 space-x-2">
                    <Button onClick={() => setEditingExtraOption(option)}>Editar</Button>
                    <Button variant="destructive" onClick={() => handleDeleteExtraOption(option.id)}>Excluir</Button>
                  </div>
                  {editingExtraOption?.id === option.id && (
                    <div className="mt-4">
                      <h6 className="font-semibold">Editar Opção Extra</h6>
                      <ExtraOptionForm
                        extraOption={editingExtraOption}
                        onSave={handleAddOrUpdateExtraOption}
                        onOpenSelectOptions={() => handleOpenSelectOptionsModal(editingExtraOption)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <SelectOptionsModal
          isOpen={isSelectOptionsModalOpen}
          onClose={() => setIsSelectOptionsModalOpen(false)}
          onSave={handleSaveSelectOptions}
          initialOptions={editingExtraOption?.options || newExtraOption.options}
        />
      </div>
    </div>
  );
};

export default AdminMenu;