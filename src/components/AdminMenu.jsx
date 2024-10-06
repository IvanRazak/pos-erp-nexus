import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddPaymentOption, useAddCustomerType, useExtraOptions, useAddExtraOption, useUpdateExtraOption, useDeleteExtraOption, useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';

const AdminMenu = () => {
  const [isExtraOptionsDialogOpen, setIsExtraOptionsDialogOpen] = useState(false);
  const [editingExtraOption, setEditingExtraOption] = useState(null);
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
  const addUser = useAddUser();

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

  const handleAddOrUpdateExtraOption = async (event) => {
    event.preventDefault();
    const extraOption = editingExtraOption || newExtraOption;
    
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

  const renderExtraOptionForm = (option, isNew = false) => (
    <form onSubmit={handleAddOrUpdateExtraOption} className="space-y-4">
      <Input
        name="name"
        value={option.name}
        onChange={(e) => isNew ? setNewExtraOption({...newExtraOption, name: e.target.value}) : setEditingExtraOption({...editingExtraOption, name: e.target.value})}
        placeholder="Nome da opção extra"
        required
      />
      <Input
        name="price"
        type="number"
        step="0.01"
        value={option.price}
        onChange={(e) => isNew ? setNewExtraOption({...newExtraOption, price: parseFloat(e.target.value)}) : setEditingExtraOption({...editingExtraOption, price: parseFloat(e.target.value)})}
        placeholder="Preço"
        required
      />
      <Select
        value={option.type}
        onValueChange={(value) => isNew ? setNewExtraOption({...newExtraOption, type: value}) : setEditingExtraOption({...editingExtraOption, type: value})}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="number">Número</SelectItem>
          <SelectItem value="select">Seleção</SelectItem>
        </SelectContent>
      </Select>
      {option.type === 'select' && (
        <Input
          name="options"
          value={option.options.join(', ')}
          onChange={(e) => {
            const newOptions = e.target.value.split(',').map(opt => opt.trim());
            isNew ? setNewExtraOption({...newExtraOption, options: newOptions}) : setEditingExtraOption({...editingExtraOption, options: newOptions});
          }}
          placeholder="Opções (separadas por vírgula)"
        />
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`editable-${isNew ? 'new' : option.id}`}
          checked={option.editable_in_cart}
          onCheckedChange={(checked) => isNew ? setNewExtraOption({...newExtraOption, editable_in_cart: checked}) : setEditingExtraOption({...editingExtraOption, editable_in_cart: checked})}
        />
        <label htmlFor={`editable-${isNew ? 'new' : option.id}`}>Editável no carrinho</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`required-${isNew ? 'new' : option.id}`}
          checked={option.required}
          onCheckedChange={(checked) => isNew ? setNewExtraOption({...newExtraOption, required: checked}) : setEditingExtraOption({...editingExtraOption, required: checked})}
        />
        <label htmlFor={`required-${isNew ? 'new' : option.id}`}>Obrigatório</label>
      </div>
      <Button type="submit">{isNew ? 'Adicionar' : 'Atualizar'}</Button>
    </form>
  );

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
              {renderExtraOptionForm(newExtraOption, true)}
              
              <h4 className="font-semibold mt-6">Opções Extras Existentes</h4>
              {extraOptions?.map((option) => (
                <div key={option.id} className="border p-4 rounded">
                  <h5 className="font-semibold">{option.name}</h5>
                  <p>Preço: R$ {option.price.toFixed(2)}</p>
                  <p>Tipo: {option.type}</p>
                  {option.type === 'select' && <p>Opções: {option.options.join(', ')}</p>}
                  <p>Editável no carrinho: {option.editable_in_cart ? 'Sim' : 'Não'}</p>
                  <p>Obrigatório: {option.required ? 'Sim' : 'Não'}</p>
                  <div className="mt-2 space-x-2">
                    <Button onClick={() => setEditingExtraOption(option)}>Editar</Button>
                    <Button variant="destructive" onClick={() => handleDeleteExtraOption(option.id)}>Excluir</Button>
                  </div>
                  {editingExtraOption?.id === option.id && (
                    <div className="mt-4">
                      <h6 className="font-semibold">Editar Opção Extra</h6>
                      {renderExtraOptionForm(editingExtraOption)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminMenu;
