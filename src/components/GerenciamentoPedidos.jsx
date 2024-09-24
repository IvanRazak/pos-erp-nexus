import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";

const GerenciamentoPedidos = () => {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroValorMinimo, setFiltroValorMinimo] = useState('');
  const [filtroValorMaximo, setFiltroValorMaximo] = useState('');

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, data: '2023-05-01', hora: '14:30', cliente: 'Cliente 1', valor: 150.00, dataEntrega: '2023-05-05', status: 'Em Produção' },
        { id: 2, data: '2023-05-02', hora: '10:15', cliente: 'Cliente 2', valor: 200.00, dataEntrega: '2023-05-06', status: 'Aguardando Aprovação' },
      ];
    },
  });

  const filtrarPedidos = () => {
    if (!pedidos) return [];
    return pedidos.filter(pedido => {
      const matchCliente = pedido.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
      const matchData = (!filtroDataInicio || new Date(pedido.data) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(pedido.data) <= filtroDataFim);
      const matchValor = (!filtroValorMinimo || pedido.valor >= parseFloat(filtroValorMinimo)) &&
                         (!filtroValorMaximo || pedido.valor <= parseFloat(filtroValorMaximo));
      return matchCliente && matchData && matchValor;
    });
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    // Implementar lógica para atualizar o status do pedido
    console.log(`Atualizando status do pedido ${pedidoId} para ${novoStatus}`);
  };

  if (isLoading) return <div>Carregando...</div>;

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
              <TableCell>{`${pedido.data} ${pedido.hora}`}</TableCell>
              <TableCell>{pedido.cliente}</TableCell>
              <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
              <TableCell>{pedido.dataEntrega}</TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => atualizarStatus(pedido.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atualizar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emProducao">Em Produção</SelectItem>
                    <SelectItem value="aguardandoAprovacao">Aguardando Aprovação</SelectItem>
                    <SelectItem value="prontoParaRetirada">Pronto para Retirada</SelectItem>
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
