import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminMenu = () => {
  const handleCadastrarOpcaoPagamento = (event) => {
    event.preventDefault();
    // Implementar lógica para cadastrar opção de pagamento
    console.log('Cadastrando opção de pagamento');
  };

  const handleCadastrarTipoCliente = (event) => {
    event.preventDefault();
    // Implementar lógica para cadastrar tipo de cliente
    console.log('Cadastrando tipo de cliente');
  };

  const handleCadastrarOpcaoExtra = (event) => {
    event.preventDefault();
    // Implementar lógica para cadastrar opção extra
    console.log('Cadastrando opção extra');
  };

  const handleGerenciarUsuarios = (event) => {
    event.preventDefault();
    // Implementar lógica para gerenciar usuários
    console.log('Gerenciando usuários');
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
              <Input placeholder="Nome da opção de pagamento" className="mb-4" />
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
              <Input placeholder="Nome do tipo de cliente" className="mb-4" />
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
              <Input placeholder="Nome da opção extra" className="mb-4" />
              <Input type="number" placeholder="Preço" className="mb-4" />
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
              <Input placeholder="Nome do usuário" className="mb-4" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
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