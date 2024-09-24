import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClienteModal from './ClienteModal';

const ClienteList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);

  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => {
      // Aqui você implementaria a chamada à API para buscar os clientes
      return [
        { id: 1, nome: 'João Silva', telefone: '(11) 99999-9999', email: 'joao@example.com', tipo: 'comum' },
        { id: 2, nome: 'Maria Santos', telefone: '(11) 88888-8888', email: 'maria@example.com', tipo: 'revendedor' },
      ];
    },
  });

  const filteredClientes = clientes?.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cliente) => {
    setSelectedCliente(cliente);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar clientes: {error.message}</div>;

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
              <TableCell>{cliente.nome}</TableCell>
              <TableCell>{cliente.telefone}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.tipo === 'comum' ? 'Cliente Comum' : 'Revendedor'}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(cliente)}>Ver Pedidos</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedCliente && (
        <ClienteModal cliente={selectedCliente} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ClienteList;