import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerTypes } from '../integrations/supabase';

const EditClienteModal = ({ cliente, onClose, onUpdate }) => {
  const [editedCliente, setEditedCliente] = useState(cliente);
  const { data: customerTypes } = useCustomerTypes();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedCliente);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente: {cliente.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            value={editedCliente.name}
            onChange={handleChange}
            placeholder="Nome"
          />
          <Input
            name="email"
            value={editedCliente.email}
            onChange={handleChange}
            placeholder="E-mail"
            type="email"
          />
          <Input
            name="phone"
            value={editedCliente.phone}
            onChange={handleChange}
            placeholder="Telefone"
          />
          <Input
            name="whatsapp"
            value={editedCliente.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp"
          />
          <Select
            name="customer_type_id"
            value={editedCliente.customer_type_id}
            onValueChange={(value) => handleChange({ target: { name: 'customer_type_id', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Cliente" />
            </SelectTrigger>
            <SelectContent>
              {customerTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClienteModal;
