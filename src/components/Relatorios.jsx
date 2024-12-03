import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders, useCustomers, useProducts, usePaymentOptions, useUsers } from '../integrations/supabase';
import { startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import ProductsReport from './reports/ProductsReport';
import OrdersReport from './reports/OrdersReport';
import FinancialReport from './reports/FinancialReport';

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
    status: 'all',
    createdBy: 'all'
  });

  const { data: pedidos } = useOrders();
  const { data: clientes } = useCustomers();
  const { data: produtos } = useProducts();
  const { data: paymentOptions } = usePaymentOptions();
  const { data: users } = useUsers();

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
      const matchCreatedBy = filters.createdBy === 'all' || item.created_by === filters.createdBy;
      
      return matchData && matchValor && matchStatus && matchCreatedBy;
    }) || [];
  };

  const gerarRelatorioFinanceiro = () => {
    if (!pedidos) return { totalVendas: 0, totalPago: 0, totalPendente: 0, porFormaPagamento: [] };

    const pedidosFiltrados = filtrarDados(pedidos);
    
    const totalVendas = pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.total_amount || 0), 0);
    const totalPago = pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.paid_amount || 0), 0);
    const totalPendente = pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.remaining_balance || 0), 0);

    const porFormaPagamento = paymentOptions?.map(option => ({
      formaPagamento: option.name,
      valor: pedidosFiltrados
        .filter(pedido => pedido.payment_option === option.name)
        .reduce((sum, pedido) => sum + (pedido.paid_amount || 0), 0)
    })) || [];

    return {
      totalVendas,
      totalPago,
      totalPendente,
      porFormaPagamento
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Relatórios</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <DatePicker
          selected={filters.dataInicio}
          onChange={(date) => setFilters({...filters, dataInicio: date})}
          placeholderText="Data Início"
        />
        <DatePicker
          selected={filters.dataFim}
          onChange={(date) => setFilters({...filters, dataFim: date})}
          placeholderText="Data Fim"
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
        <Select 
          value={filters.createdBy || 'all'} 
          onValueChange={(value) => setFilters({...filters, createdBy: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por Usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Usuários</SelectItem>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.username}>
                {user.username}
              </SelectItem>
            ))}
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
          <ProductsReport 
            filters={filters}
            pedidos={pedidos}
            produtos={produtos}
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <OrdersReport 
            filteredOrders={filtrarDados(pedidos)}
            clientes={clientes}
          />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinancialReport 
            financialData={gerarRelatorioFinanceiro()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;