import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPaymentOption, useAddCustomerType, useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';
import GerenciarOpcoesExtras from './GerenciarOpcoesExtras';
import GerenciarOpcoesSelecao from './GerenciarOpcoesSelecao';
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminMenu = () => {
  const [isGerenciarOpcoesExtrasOpen, setIsGerenciarOpcoesExtrasOpen] = useState(false);
  const [isGerenciarOpcoesSelecaoOpen, setIsGerenciarOpcoesSelecaoOpen] = useState(false);
  const [isPaymentOptionDialogOpen, setIsPaymentOptionDialogOpen] = useState(false);
  const [isCustomerTypeDialogOpen, setIsCustomerTypeDialogOpen] = useState(false);
  const [isUserManagementDialogOpen, setIsUserManagementDialogOpen] = useState(false);
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
        setIsPaymentOptionDialogOpen(false);
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
        setIsCustomerTypeDialogOpen(false);
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
          setIsUserManagementDialogOpen(false);
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
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between">
            Menu Administrativo
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => setIsPaymentOptionDialogOpen(true)}>
            Cadastrar Opção de Pagamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCustomerTypeDialogOpen(true)}>
            Cadastrar Tipo de Cliente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsUserManagementDialogOpen(true)}>
            Gerenciar Usuários
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsGerenciarOpcoesExtrasOpen(true)}>
            Gerenciar Opções Extras
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsGerenciarOpcoesSelecaoOpen(true)}>
            Gerenciar Opções de Seleção
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPaymentOptionDialogOpen} onOpenChange={setIsPaymentOptionDialogOpen}>
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

      <Dialog open={isCustomerTypeDialogOpen} onOpenChange={setIsCustomerTypeDialogOpen}>
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

      <Dialog open={isUserManagementDialogOpen} onOpenChange={setIsUserManagementDialogOpen}>
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

      <GerenciarOpcoesExtras
        isOpen={isGerenciarOpcoesExtrasOpen}
        onClose={() => setIsGerenciarOpcoesExtrasOpen(false)}
      />

      <GerenciarOpcoesSelecao
        isOpen={isGerenciarOpcoesSelecaoOpen}
        onClose={() => setIsGerenciarOpcoesSelecaoOpen(false)}
      />
    </div>
  );
};

export default AdminMenu;