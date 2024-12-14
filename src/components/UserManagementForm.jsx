import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddUser } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";
import bcrypt from 'bcryptjs';

const UserManagementForm = () => {
  const addUser = useAddUser();

  const handleSubmit = async (event) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="username" placeholder="Nome do usuário" required />
      <Input name="email" type="email" placeholder="E-mail" required />
      <Input name="password" type="password" placeholder="Senha" required />
      <Select name="role" required>
        <SelectTrigger>
          <SelectValue placeholder="Nível de acesso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="gerente">Gerente</SelectItem>
          <SelectItem value="operator">Operador</SelectItem>
          <SelectItem value="seller">Vendedor</SelectItem>
          <SelectItem value="producao">Produção</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Adicionar Usuário</Button>
    </form>
  );
};

export default UserManagementForm;
