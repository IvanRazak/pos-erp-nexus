import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useUpdateOrder, useCustomers } from '../integrations/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import PedidoDetalhesModal from './PedidoDetalhesModal';
import { useAuth } from '../hooks/useAuth';

const GerenciamentoPedidos = () => {
  const [filtros, setFiltros] = useState({
    cliente: '',
    numeroPedido: '',
    dataInicio: null,
    dataFim: null,
    valorMinimo: '',
    valorMaximo: ''
  });
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: pedidos, isLoading: isLoadingPedidos, error: errorPedidos } = useOrders();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();
  const updateOrder = useUpdateOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    if (pedidos) {
      filtrarPedidos();
    }
  }, [pedidos, filtros]);

  const filtrarPedidos = () => {
    if (!pedidos) return;
    const filtered = pedidos.filter(pedido => {
      const cliente = clientes?.find(c => c.id === pedido.customer_id);
      const matchCliente = !filtros.cliente || (cliente && cliente.name && cliente.name.toLowerCase().includes(filtros.cliente.toLowerCase()));
      const matchNumeroPedido = !filtros.numeroPedido || (pedido.order_number && pedido.order_number.toString().includes(filtros.numeroPedido));
      const matchData = (!filtros.dataInicio || !filtros.dataFim || (pedido.created_at && isWithinInterval(parseISO(pedido.created_at), {
        start: startOfDay(filtros.dataInicio),
        end: endOfDay(filtros.dataFim)
      })));
      const matchValor = (!filtros.valorMinimo || (pedido.total_amount && pedido.total_amount >= parseFloat(filtros.valorMinimo))) &&
                         (!filtros.valorMaximo || (pedido.total_amount && pedido.total_amount <= parseFloat(filtros.valorMaximo)));
      return matchCliente && matchNumeroPedido && matchData && matchValor;
    });
    setPedidosFiltrados(filtered);
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    updateOrder.mutate({ id: pedidoId, status: novoStatus });
  };

  const abrirModalDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
  };

  const fecharModalDetalhes = () => {
    setPedidoSelecionado(null);
  };

  if (isLoadingPedidos || isLoadingClientes) return <div>Carregando...</div>;
  if (errorPedidos) return <div>Erro ao carregar pedidos: {errorPedidos.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Input
          placeholder="Filtrar por nome do cliente"
          value={filtros.cliente}
          onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
        />
        <Input
          placeholder="Filtrar por número do pedido"
          value={filtros.numeroPedido}
          onChange={(e) => setFiltros({...filtros, numeroPedido: e.target.value})}
        />
        <div className="flex space-x-2">
          <DatePicker
            selected={filtros.dataInicio}
            onChange={(date) => setFiltros({...filtros, dataInicio: date})}
            placeholderText="Data Início"
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
          />
          <DatePicker
            selected={filtros.dataFim}
            onChange={(date) => setFiltros({...filtros, dataFim: date})}
            placeholderText="Data Fim"
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <Input
          type="number"
          placeholder="Valor Mínimo"
          value={filtros.valorMinimo}
          onChange={(e) => setFiltros({...filtros, valorMinimo: e.target.value})}
        />
        <Input
          type="number"
          placeholder="Valor Máximo"
          value={filtros.valorMaximo}
          onChange={(e) => setFiltros({...filtros, valorMaximo: e.target.value})}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Data e Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Valor Adicional</TableHead>
            <TableHead>Data de Entrega</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidosFiltrados.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>{pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</TableCell>
              <TableCell>{clientes?.find(c => c.id === pedido.customer_id)?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.discount?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                {pedido.additional_value > 0 ? (
                  <>
                    R$ {pedido.additional_value.toFixed(2)}
                    <br />
                    <span className="text-sm text-gray-500">{pedido.additional_value_description || 'Sem descrição'}</span>
                  </>
                ) : 'N/A'}
              </TableCell>
              <TableCell>{pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</TableCell>
              <TableCell>{pedido.status}</TableCell>
              <TableCell>{pedido.created_by || 'N/A'}</TableCell>
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
                <Button onClick={() => abrirModalDetalhes(pedido)} className="ml-2">
                  Ver Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pedidoSelecionado && (
        <PedidoDetalhesModal pedido={pedidoSelecionado} onClose={fecharModalDetalhes} />
      )}
    </div>
  );
};

export default GerenciamentoPedidos;