import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPaymentOption, useAddCustomerType, useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';
import GerenciarOpcoesExtras from './GerenciarOpcoesExtras';
import GerenciarOpcoesSelecao from './GerenciarOpcoesSelecao';
import SystemLogs from './SystemLogs';

const AdminMenu = () => {
  const [isGerenciarOpcoesExtrasOpen, setIsGerenciarOpcoesExtrasOpen] = useState(false);
  const [isGerenciarOpcoesSelecaoOpen, setIsGerenciarOpcoesSelecaoOpen] = useState(false);
  const [isSystemLogsOpen, setIsSystemLogsOpen] = useState(false);
  const addPaymentOption = useAddPaymentOption();
  const addCustomerType = useAddCustomerType();
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

        <Button className="w-full" onClick={() => setIsGerenciarOpcoesExtrasOpen(true)}>
          Gerenciar Opções Extras
        </Button>

        <Button className="w-full" onClick={() => setIsGerenciarOpcoesSelecaoOpen(true)}>
          Gerenciar Opções de Seleção
        </Button>

        <Button className="w-full" onClick={() => setIsSystemLogsOpen(true)}>
          Visualizar Logs do Sistema
        </Button>
      </div>

      <GerenciarOpcoesExtras
        isOpen={isGerenciarOpcoesExtrasOpen}
        onClose={() => setIsGerenciarOpcoesExtrasOpen(false)}
      />

      <GerenciarOpcoesSelecao
        isOpen={isGerenciarOpcoesSelecaoOpen}
        onClose={() => setIsGerenciarOpcoesSelecaoOpen(false)}
      />

      <SystemLogs
        isOpen={isSystemLogsOpen}
        onClose={() => setIsSystemLogsOpen(false)}
      />
    </div>
  );
};

export default AdminMenu;