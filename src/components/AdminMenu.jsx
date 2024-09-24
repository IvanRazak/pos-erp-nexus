import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPaymentOption, useAddCustomerType, useAddExtraOption, useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const AdminMenu = () => {
  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();
  const addExtraOption = useAddExtraOption();
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

  const handleGerenciarUsuarios = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    addUser.mutate({ username, email, password, role }, {
      onSuccess: () => {
        toast({ title: "Usuário cadastrado com sucesso!" });
        event.target.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao cadastrar usuário", description: error.message, variant: "destructive" });
      }
    });
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
      </div>
    </div>
  );
};

export default AdminMenu;
