import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ClienteModal from './ClienteModal';
import { useCustomerTypes, useWebhookSettings } from '../integrations/supabase';
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useAuth } from '../hooks/useAuth';

const ClienteList = ({ clientes, onDelete, onEdit, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteParaWebhook, setClienteParaWebhook] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const { data: customerTypes } = useCustomerTypes();
  const { data: webhookSettings } = useWebhookSettings();
  const { user } = useAuth();

  const maskWhatsApp = (whatsapp) => {
    if (!whatsapp) return '';
    if (user?.role === 'admin') return whatsapp;
    
    // Remove qualquer caractere não numérico
    const numericOnly = whatsapp.replace(/\D/g, '');
    
    // Se tiver menos de 4 dígitos, retorna tudo mascarado
    if (numericOnly.length <= 4) {
      return '*'.repeat(numericOnly.length);
    }
    
    // Mascara todos os dígitos exceto os últimos 4
    return '*'.repeat(numericOnly.length - 4) + numericOnly.slice(-4);
  };

  const filteredClientes = clientes?.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.whatsapp?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerPedidos = (cliente) => {
    setSelectedCliente(cliente);
  };

  const handleSendWebhook = async (cliente) => {
    try {
      if (!webhookSettings?.webhook_url) {
        throw new Error('URL do webhook não configurada');
      }

      const loggedUser = localStorage.getItem('user');
      const userData = loggedUser ? JSON.parse(loggedUser) : null;

      const response = await fetch(webhookSettings.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: cliente.id,
          nome: cliente.name,
          telefone: cliente.phone,
          whatsapp: cliente.whatsapp,
          email: cliente.email,
          user_id: userData?.id,
          user_name: userData?.username,
          endereco: cliente.address,
          cidade: cliente.city,
          estado: cliente.state,
          cep: cliente.postal_code
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }

      toast.success("Dados enviados com sucesso!");
      setClienteParaWebhook(null);
    } catch (error) {
      toast.error("Erro ao enviar dados: " + error.message);
      setClienteParaWebhook(null);
    }
  };

  const getCustomerTypeName = (typeId) => {
    const customerType = customerTypes?.find(type => type.id === typeId);
    return customerType ? customerType.name : 'N/A';
  };

  useEffect(() => {
    let timer;
    if (clienteParaWebhook && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      if (!clienteParaWebhook) {
        setCountdown(5);
      }
    };
  }, [clienteParaWebhook, countdown]);

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
            <TableHead>WhatsApp</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Tipo de Cliente</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClientes?.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.name}</TableCell>
              <TableCell>{maskWhatsApp(cliente.whatsapp)}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{getCustomerTypeName(cliente.customer_type_id)}</TableCell>
              <TableCell>
                <Button onClick={() => onEdit(cliente)} className="mr-2">Editar</Button>
                <Button onClick={() => handleVerPedidos(cliente)} className="mr-2">Ver Pedidos</Button>
                <Button onClick={() => setClienteParaWebhook(cliente)} className="mr-2" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
                {isAdmin && (
                  <Button onClick={() => onDelete(cliente.id)} variant="destructive">Excluir</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={clienteParaWebhook !== null} onOpenChange={(open) => !open && setClienteParaWebhook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Envio</DialogTitle>
            <DialogDescription>
              Deseja enviar uma mensagem para o cliente {clienteParaWebhook?.name} ?
              {countdown > 0 && <p className="text-sm text-muted-foreground mt-2">Aguarde {countdown} segundos...</p>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClienteParaWebhook(null)}>Cancelar</Button>
            <Button 
              onClick={() => handleSendWebhook(clienteParaWebhook)}
              disabled={countdown > 0}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
