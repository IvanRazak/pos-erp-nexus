import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomers } from '../integrations/supabase';

const BuscarClienteModal = ({ isOpen, onClose, onSelectCliente }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clientes } = useCustomers();
  const [filteredClientes, setFilteredClientes] = useState([]);

  useEffect(() => {
    if (clientes) {
      setFilteredClientes(
        clientes.filter(cliente =>
          cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.phone?.includes(searchTerm)
        )
      );
    }
  }, [searchTerm, clientes]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buscar Cliente</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar por nome ou telefone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              className="cursor-pointer p-2 hover:bg-gray-100"
              onClick={() => onSelectCliente(cliente)}
            >
              <div className="font-bold">{cliente.name}</div>
              <div className="text-sm text-gray-600">{cliente.phone}</div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BuscarClienteModal;