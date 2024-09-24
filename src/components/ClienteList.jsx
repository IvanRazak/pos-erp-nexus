import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClienteModal from './ClienteModal';
import EditClienteModal from './EditClienteModal';

const ClienteList = ({ clientes, onDelete, onUpdate, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editingCliente, setEditingCliente] = useState(null);

  const filteredClientes = clientes?.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.phone?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cliente) => {
    setSelectedCliente(cliente);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
  };

  const handleOpenEditModal = (cliente) => {
    setEditingCliente(cliente);
  };

  const handleCloseEditModal = () => {
    setEditingCliente(null);
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
            <TableHead>Tipo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClientes?.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.name}</TableCell>
              <TableCell>{cliente.phone}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.customer_type?.name || 'N/A'}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(cliente)}>Ver Pedidos</Button>
                {isAdmin && (
                  <Button onClick={() => handleOpenEditModal(cliente)} className="ml-2">Editar</Button>
                )}
                <Button onClick={() => onDelete(cliente.id)} variant="destructive" className="ml-2">Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedCliente && (
        <ClienteModal cliente={selectedCliente} onClose={handleCloseModal} onUpdate={onUpdate} />
      )}
      {editingCliente && (
        <EditClienteModal cliente={editingCliente} onClose={handleCloseEditModal} onUpdate={onUpdate} />
      )}
    </div>
  );
};

export default ClienteList;
