import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddUser, useUsers, useUpdateUser, useDeleteUser } from '../integrations/supabase';
import { toast } from "sonner";
import bcrypt from 'bcryptjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2, Lock, Unlock } from 'lucide-react';

const UserManagementDialog = () => {
  const [editingUser, setEditingUser] = useState(null);
  const { data: users, isLoading } = useUsers();
  const addUser = useAddUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');

    try {
      if (editingUser) {
        const updateData = {
          id: editingUser.id,
          username,
          email,
          role
        };

        // Only update password if a new one was provided
        if (password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password_hash = await bcrypt.hash(password, salt);
        }

        updateUser.mutate(updateData, {
          onSuccess: () => {
            toast.success("Usuário atualizado com sucesso!");
            setEditingUser(null);
            event.target.reset();
          },
          onError: (error) => {
            toast.error("Erro ao atualizar usuário: " + error.message);
          }
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        addUser.mutate({ username, email, password_hash, role }, {
          onSuccess: () => {
            toast.success("Usuário cadastrado com sucesso!");
            event.target.reset();
          },
          onError: (error) => {
            toast.error("Erro ao cadastrar usuário: " + error.message);
          }
        });
      }
    } catch (error) {
      toast.error("Erro ao processar senha: " + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser.mutate(userId, {
        onSuccess: () => {
          toast.success("Usuário excluído com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao excluir usuário: " + error.message);
        }
      });
    }
  };

  const handleToggleBlock = (user) => {
    const message = user.blocked ? 'desbloquear' : 'bloquear';
    if (window.confirm(`Tem certeza que deseja ${message} este usuário?`)) {
      updateUser.mutate(
        {
          id: user.id,
          blocked: !user.blocked
        },
        {
          onSuccess: () => {
            toast.success(`Usuário ${user.blocked ? 'desbloqueado' : 'bloqueado'} com sucesso!`);
          },
          onError: (error) => {
            toast.error(`Erro ao ${message} usuário: ${error.message}`);
          }
        }
      );
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          name="username" 
          placeholder="Nome do usuário" 
          defaultValue={editingUser?.username || ''}
          required 
        />
        <Input 
          name="email" 
          type="email" 
          placeholder="E-mail" 
          defaultValue={editingUser?.email || ''}
          required 
        />
        <Input 
          name="password" 
          type="password" 
          placeholder={editingUser ? "Nova senha (deixe em branco para manter a atual)" : "Senha"} 
          required={!editingUser}
        />
        <Select name="role" defaultValue={editingUser?.role || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Nível de acesso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="operator">Operador</SelectItem>
            <SelectItem value="seller">Vendedor</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button type="submit">
            {editingUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}
          </Button>
          {editingUser && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className={user.blocked ? "bg-red-50" : ""}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.blocked ? 'Bloqueado' : 'Ativo'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleBlock(user)}
                    >
                      {user.blocked ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementDialog;