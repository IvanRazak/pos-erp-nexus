import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPaymentOption, useAddCustomerType, useAddExtraOption, useUpdateExtraOption, useDeleteExtraOption, useAddUser, useExtraOptions } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';
import ExtraOptionForm from './ExtraOptionForm';
import SelectOptionsModal from './SelectOptionsModal';
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminMenu = () => {
  const [isSelectOptionsModalOpen, setIsSelectOptionsModalOpen] = useState(false);
  const [currentExtraOption, setCurrentExtraOption] = useState(null);
  const [editingExtraOption, setEditingExtraOption] = useState(null);
  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();
  const addExtraOption = useAddExtraOption();
  const updateExtraOption = useUpdateExtraOption();
  const deleteExtraOption = useDeleteExtraOption();
  const addUser = useAddUser();
  const { data: extraOptions } = useExtraOptions();

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

  const handleCadastrarOpcaoExtra = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('extraOption');
    const price = parseFloat(formData.get('price'));
    addExtraOption.mutate({ name, price }, {
      onSuccess: () => {
        toast({ title: "Opção extra cadastrada com sucesso!" });
        event.target.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao cadastrar opção extra", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleGerenciarUsuarios = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      addUser.mutate({ username, email, password_hash, role }, {
        onSuccess: () => {
          toast({ title: "Usuário cadastrado com sucesso!" });
          event.target.reset();
        },
        onError: (error) => {
          toast({ title: "Erro ao cadastrar usuário", description: error.message, variant: "destructive" });
        }
      });
    } catch (error) {
      toast({ title: "Erro ao gerar hash da senha", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveExtraOption = (extraOption) => {
    const saveFunction = extraOption.id ? updateExtraOption : addExtraOption;
    saveFunction.mutate(extraOption, {
      onSuccess: () => {
        toast({ title: `Opção extra ${extraOption.id ? 'atualizada' : 'cadastrada'} com sucesso!` });
        setEditingExtraOption(null);
      },
      onError: (error) => {
        toast({ title: `Erro ao ${extraOption.id ? 'atualizar' : 'cadastrar'} opção extra`, description: error.message, variant: "destructive" });
      }
    });
  };

  const handleDeleteExtraOption = (id) => {
    deleteExtraOption.mutate(id, {
      onSuccess: () => {
        toast({ title: "Opção extra excluída com sucesso!" });
        setEditingExtraOption(null);
      },
      onError: (error) => {
        toast({ title: "Erro ao excluir opção extra", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleOpenSelectOptions = (extraOption) => {
    setCurrentExtraOption(extraOption);
    setIsSelectOptionsModalOpen(true);
  };

  const handleSaveSelectOptions = (options) => {
    const updatedExtraOption = { 
      ...currentExtraOption, 
      options: JSON.stringify(options)
    };
    handleSaveExtraOption(updatedExtraOption);
    setIsSelectOptionsModalOpen(false);
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
            <Button className="w-full">Cadastrar Opção Extra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Opção Extra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCadastrarOpcaoExtra}>
              <Input name="extraOption" placeholder="Nome da opção extra" className="mb-4" />
              <Input name="price" type="number" step="0.01" placeholder="Preço" className="mb-4" />
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
            <form onSubmit={handleGerenciarUsuarios}>
              <Input name="username" placeholder="Nome do usuário" className="mb-4" />
              <Input name="email" type="email" placeholder="E-mail" className="mb-4" />
              <Input name="password" type="password" placeholder="Senha" className="mb-4" />
              <Select name="role">
                <SelectTrigger>
                  <SelectValue placeholder="Nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="seller">Vendedor</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="mt-4">Adicionar Usuário</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Gerenciar Opções Extras</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Opções Extras</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {extraOptions?.map((option) => (
                  <div key={option.id} className="flex justify-between items-center">
                    <span>{option.name}</span>
                    <Button onClick={() => setEditingExtraOption(option)}>Editar</Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {editingExtraOption && (
              <ExtraOptionForm
                extraOption={editingExtraOption}
                onSave={handleSaveExtraOption}
                onDelete={() => handleDeleteExtraOption(editingExtraOption.id)}
                onOpenSelectOptions={() => handleOpenSelectOptions(editingExtraOption)}
              />
            )}
            {!editingExtraOption && (
              <Button onClick={() => setEditingExtraOption({})}>Adicionar Nova Opção Extra</Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <SelectOptionsModal
        isOpen={isSelectOptionsModalOpen}
        onClose={() => setIsSelectOptionsModalOpen(false)}
        onSave={handleSaveSelectOptions}
        initialOptions={currentExtraOption?.options ? JSON.parse(currentExtraOption.options) : []}
      />
    </div>
  );
};

export default AdminMenu;