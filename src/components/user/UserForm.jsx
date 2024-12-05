import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UserForm = ({ onSubmit, editingUser, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <Select name="role" defaultValue={editingUser?.role || ''} required>
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default UserForm;