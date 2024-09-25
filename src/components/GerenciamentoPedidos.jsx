import React, { useState } from 'react';
import { useOrders, useUpdateOrder } from '../integrations/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isWithinInterval, parseISO } from 'date-fns';

const GerenciamentoPedidos = () => {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroValorMinimo, setFiltroValorMinimo] = useState('');
  const [filtroValorMaximo, setFiltroValorMaximo] = useState('');

  const { data: pedidos, isLoading, error } = useOrders();
  const updateOrder = useUpdateOrder();

  const filtrarPedidos = () => {
    if (!pedidos) return [];
    return pedidos.filter(pedido => {
      const matchCliente = pedido.customer_name?.toLowerCase().includes(filtroCliente.toLowerCase());
      const matchData = (!filtroDataInicio || !filtroDataFim || isWithinInterval(parseISO(pedido.created_at), {
        start: filtroDataInicio,
        end: filtroDataFim
      }));
      const matchValor = (!filtroValorMinimo || pedido.total_amount >= parseFloat(filtroValorMinimo)) &&
                         (!filtroValorMaximo || pedido.total_amount <= parseFloat(filtroValorMaximo));
      return matchCliente && matchData && matchValor;
    });
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    updateOrder.mutate({ id: pedidoId, status: novoStatus });
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar pedidos: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          placeholder="Filtrar por cliente"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        />
        <div className="flex space-x-2">
          <DatePicker
            selected={filtroDataInicio}
            onChange={setFiltroDataInicio}
            placeholderText="Data Início"
          />
          <DatePicker
            selected={filtroDataFim}
            onChange={setFiltroDataFim}
            placeholderText="Data Fim"
          />
        </div>
        <Input
          type="number"
          placeholder="Valor Mínimo"
          value={filtroValorMinimo}
          onChange={(e) => setFiltroValorMinimo(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Valor Máximo"
          value={filtroValorMaximo}
          onChange={(e) => setFiltroValorMaximo(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Data e Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data de Entrega</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarPedidos().map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.id}</TableCell>
              <TableCell>{format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>{pedido.customer_name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
              <TableCell>{pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => atualizarStatus(pedido.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atualizar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_production">Em Produção</SelectItem>
                    <SelectItem value="awaiting_approval">Aguardando Aprovação</SelectItem>
                    <SelectItem value="ready_for_pickup">Pronto para Retirada</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GerenciamentoPedidos;
