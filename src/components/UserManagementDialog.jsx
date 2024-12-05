import React, { useState } from 'react';
import { useAddUser, useUsers, useUpdateUser, useDeleteUser } from '../integrations/supabase';
import { toast } from "sonner";
import bcrypt from 'bcryptjs';
import UserForm from './user/UserForm';
import UserTable from './user/UserTable';

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
      <UserForm 
        onSubmit={handleSubmit}
        editingUser={editingUser}
        onCancel={handleCancel}
      />
      <UserTable 
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleBlock={handleToggleBlock}
      />
    </div>
  );
};

export default UserManagementDialog;