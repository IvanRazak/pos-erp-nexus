import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers, useUpdateUser, useDeleteUser } from '../integrations/supabase/hooks/users';
import { toast } from "sonner";

const UserList = () => {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      id: editingUser.id,
      username: formData.get('username'),
      email: formData.get('email'),
      role: formData.get('role')
    };

    // Adiciona o password_hash apenas se uma nova senha foi fornecida
    const newPassword = formData.get('password');
    if (newPassword && newPassword.trim() !== '') {
      userData.password_hash = newPassword;
    }

    try {
      await updateUser.mutateAsync(userData);
      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
    } catch (error) {
      toast.error("Erro ao atualizar usuário: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success("Usuário excluído com sucesso!");
      setUserToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir usuário: " + error.message);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Nível de Acesso</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button onClick={() => setEditingUser(user)} variant="outline" className="mr-2">
                  Editar
                </Button>
                <Button onClick={() => setUserToDelete(user)} variant="destructive">
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de Edição */}
      <Dialog open={editingUser !== null} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">Nome do usuário</label>
              <Input
                id="username"
                name="username"
                defaultValue={editingUser?.username}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={editingUser?.email}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Nova Senha (deixe em branco para manter a atual)</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <label htmlFor="role" className="text-sm font-medium">Nível de acesso</label>
              <Select name="role" defaultValue={editingUser?.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="seller">Vendedor</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={userToDelete !== null} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.username}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserList;
