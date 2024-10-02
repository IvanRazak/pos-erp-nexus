import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders, useCustomers, useProducts } from '../integrations/supabase';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);

  const { data: pedidos } = useOrders();
  const { data: clientes } = useCustomers();
  const { data: produtos } = useProducts();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    if (tipoRelatorio && dataInicio && dataFim) {
      gerarRelatorio();
    }
  }, [tipoRelatorio, dataInicio, dataFim]);

  const gerarRelatorio = () => {
    if (!pedidos || !clientes || !produtos) return;

    const pedidosFiltrados = pedidos.filter(pedido => {
      const dataPedido = parseISO(pedido.created_at);
      return isWithinInterval(dataPedido, { start: startOfDay(dataInicio), end: endOfDay(dataFim) });
    });

    let dados = [];

    switch (tipoRelatorio) {
      case 'vendas':
        dados = pedidosFiltrados.map(pedido => ({
          data: format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR }),
          numeroPedido: pedido.order_number,
          cliente: clientes.find(c => c.id === pedido.customer_id)?.name || 'N/A',
          valor: pedido.total_amount.toFixed(2),
        }));
        break;
      case 'produtos':
        const produtosVendidos = pedidosFiltrados.flatMap(pedido => pedido.items || []);
        dados = produtos.map(produto => {
          const vendas = produtosVendidos.filter(item => item.product_id === produto.id);
          const quantidade = vendas.reduce((sum, item) => sum + item.quantity, 0);
          const valorTotal = vendas.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
          return {
            produto: produto.name,
            quantidade,
            valorTotal: valorTotal.toFixed(2),
          };
        }).filter(item => item.quantidade > 0);
        break;
      case 'clientes':
        dados = clientes.map(cliente => {
          const pedidosCliente = pedidosFiltrados.filter(pedido => pedido.customer_id === cliente.id);
          const valorTotal = pedidosCliente.reduce((sum, pedido) => sum + pedido.total_amount, 0);
          return {
            cliente: cliente.name,
            quantidadePedidos: pedidosCliente.length,
            valorTotal: valorTotal.toFixed(2),
          };
        }).filter(item => item.quantidadePedidos > 0);
        break;
    }

    setDadosRelatorio(dados);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vendas">Relatório de Vendas</SelectItem>
            <SelectItem value="produtos">Relatório de Produtos</SelectItem>
            <SelectItem value="clientes">Relatório de Clientes</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          selected={dataInicio}
          onChange={setDataInicio}
          placeholderText="Data Início"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <DatePicker
          selected={dataFim}
          onChange={setDataFim}
          placeholderText="Data Fim"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
      </div>
      <Button onClick={gerarRelatorio}>Gerar Relatório</Button>
      {dadosRelatorio.length > 0 && (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              {Object.keys(dadosRelatorio[0]).map((key) => (
                <TableHead key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosRelatorio.map((item, index) => (
              <TableRow key={index}>
                {Object.values(item).map((value, valueIndex) => (
                  <TableCell key={valueIndex}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Relatorios;
