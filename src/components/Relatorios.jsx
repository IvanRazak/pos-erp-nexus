import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders, useCustomers, useProducts, usePaymentOptions } from '../integrations/supabase';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Relatorios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    dataInicio: null,
    dataFim: null,
    cliente: '',
    produto: '',
    formaPagamento: '',
    valorMinimo: '',
    valorMaximo: '',
    status: 'all'
  });

  const { data: pedidos } = useOrders();
  const { data: clientes } = useCustomers();
  const { data: produtos } = useProducts();
  const { data: paymentOptions } = usePaymentOptions();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const filtrarDados = (dados) => {
    return dados?.filter(item => {
      const itemDate = parseISO(item.created_at);
      const matchData = (!filters.dataInicio || !filters.dataFim || isWithinInterval(itemDate, {
        start: startOfDay(filters.dataInicio),
        end: endOfDay(filters.dataFim)
      }));
      const matchValor = (!filters.valorMinimo || item.total_amount >= parseFloat(filters.valorMinimo)) &&
                        (!filters.valorMaximo || item.total_amount <= parseFloat(filters.valorMaximo));
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      
      return matchData && matchValor && matchStatus;
    }) || [];
  };

  const gerarRelatorioProdutos = () => {
    if (!pedidos || !produtos) return [];
    
    const produtosVendidos = pedidos.flatMap(pedido => 
      pedido.items?.map(item => ({
        ...item,
        data: pedido.created_at,
        status: pedido.status
      })) || []
    );

    const relatorio = produtos.map(produto => {
      const vendasProduto = produtosVendidos.filter(item => 
        item.product_id === produto.id &&
        isWithinInterval(parseISO(item.data), {
          start: filters.dataInicio ? startOfDay(filters.dataInicio) : startOfDay(new Date(0)),
          end: filters.dataFim ? endOfDay(filters.dataFim) : endOfDay(new Date())
        })
      );

      const quantidade = vendasProduto.reduce((sum, item) => sum + item.quantity, 0);
      const valorTotal = vendasProduto.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      return {
        produto: produto.name,
        quantidade,
        valorTotal
      };
    }).filter(item => item.quantidade > 0);

    return relatorio;
  };

  const gerarRelatorioFinanceiro = () => {
    if (!pedidos) return { totalVendas: 0, totalPago: 0, totalPendente: 0, porFormaPagamento: [] };

    const pedidosFiltrados = filtrarDados(pedidos);
    
    const totalVendas = pedidosFiltrados.reduce((sum, pedido) => sum + pedido.total_amount, 0);
    const totalPago = pedidosFiltrados.reduce((sum, pedido) => sum + pedido.paid_amount, 0);
    const totalPendente = pedidosFiltrados.reduce((sum, pedido) => sum + pedido.remaining_balance, 0);

    const porFormaPagamento = paymentOptions?.map(option => ({
      formaPagamento: option.name,
      valor: pedidosFiltrados
        .filter(pedido => pedido.payment_option === option.name)
        .reduce((sum, pedido) => sum + pedido.paid_amount, 0)
    })) || [];

    return {
      totalVendas,
      totalPago,
      totalPendente,
      porFormaPagamento
    };
  };

  const gerarRelatorioPedidos = () => {
    if (!pedidos || !clientes) return [];

    return filtrarDados(pedidos).map(pedido => ({
      numeroPedido: pedido.order_number,
      cliente: clientes.find(c => c.id === pedido.customer_id)?.name || 'N/A',
      data: format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      valor: pedido.total_amount,
      status: pedido.status,
      formaPagamento: pedido.payment_option
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Relatórios</h2>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <DatePicker
          selected={filters.dataInicio}
          onChange={(date) => setFilters({...filters, dataInicio: date})}
          placeholderText="Data Início"
          locale={ptBR}
        />
        <DatePicker
          selected={filters.dataFim}
          onChange={(date) => setFilters({...filters, dataFim: date})}
          placeholderText="Data Fim"
          locale={ptBR}
        />
        <Select onValueChange={(value) => setFilters({...filters, status: value})} value={filters.status}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in_production">Em Produção</SelectItem>
            <SelectItem value="ready_for_pickup">Pronto para Retirada</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          type="number"
          placeholder="Valor Mínimo"
          value={filters.valorMinimo}
          onChange={(e) => setFilters({...filters, valorMinimo: e.target.value})}
        />
        <Input
          type="number"
          placeholder="Valor Máximo"
          value={filters.valorMaximo}
          onChange={(e) => setFilters({...filters, valorMaximo: e.target.value})}
        />
      </div>

      <Tabs defaultValue="produtos" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade Vendida</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gerarRelatorioProdutos().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.produto}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>R$ {item.valorTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <BarChart width={800} height={300} data={gerarRelatorioProdutos()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
                <Bar dataKey="valorTotal" fill="#82ca9d" name="Valor Total" />
              </BarChart>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pedidos">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número do Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gerarRelatorioPedidos().map((pedido, index) => (
                <TableRow key={index}>
                  <TableCell>{pedido.numeroPedido}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.data}</TableCell>
                  <TableCell>R$ {pedido.valor.toFixed(2)}</TableCell>
                  <TableCell>{pedido.status}</TableCell>
                  <TableCell>{pedido.formaPagamento}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="financeiro">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <h3 className="font-semibold">Total de Vendas</h3>
                <p className="text-2xl">R$ {gerarRelatorioFinanceiro().totalVendas.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <h3 className="font-semibold">Total Pago</h3>
                <p className="text-2xl">R$ {gerarRelatorioFinanceiro().totalPago.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-lg">
                <h3 className="font-semibold">Total Pendente</h3>
                <p className="text-2xl">R$ {gerarRelatorioFinanceiro().totalPendente.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Por Forma de Pagamento</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gerarRelatorioFinanceiro().porFormaPagamento.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.formaPagamento}</TableCell>
                      <TableCell>R$ {item.valor.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <BarChart width={800} height={300} data={gerarRelatorioFinanceiro().porFormaPagamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formaPagamento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#82ca9d" name="Valor Total" />
              </BarChart>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;