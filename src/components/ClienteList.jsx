import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClienteModal from './ClienteModal';
import { useCustomerTypes } from '../integrations/supabase';

const ClienteList = ({ clientes, onDelete, onEdit, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const { data: customerTypes } = useCustomerTypes();

  const filteredClientes = clientes?.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.phone?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerPedidos = (cliente) => {
    setSelectedCliente(cliente);
  };

  const getCustomerTypeName = (typeId) => {
    const customerType = customerTypes?.find(type => type.id === typeId);
    return customerType ? customerType.name : 'N/A';
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Buscar cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Tipo de Cliente</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClientes?.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.name}</TableCell>
              <TableCell>{cliente.phone}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{getCustomerTypeName(cliente.customer_type_id)}</TableCell>
              <TableCell>
                <Button onClick={() => onEdit(cliente)} className="mr-2">Editar</Button>
                <Button onClick={() => handleVerPedidos(cliente)} className="mr-2">Ver Pedidos</Button>
                {isAdmin && (
                  <Button onClick={() => onDelete(cliente.id)} variant="destructive">Excluir</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedCliente && (
        <ClienteModal
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </div>
  );
};

export default ClienteList;
