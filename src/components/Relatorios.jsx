import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Relatorios = () => {
  const { data: produtosMaisVendidos, isLoading: isLoadingProdutos } = useQuery({
    queryKey: ['produtosMaisVendidos'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { nome: 'Produto A', quantidade: 100 },
        { nome: 'Produto B', quantidade: 80 },
        { nome: 'Produto C', quantidade: 60 },
        { nome: 'Produto D', quantidade: 40 },
        { nome: 'Produto E', quantidade: 20 },
      ];
    },
  });

  const { data: vendasPorUsuario, isLoading: isLoadingVendas } = useQuery({
    queryKey: ['vendasPorUsuario'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { nome: 'Usuário 1', vendas: 5000 },
        { nome: 'Usuário 2', vendas: 4000 },
        { nome: 'Usuário 3', vendas: 3000 },
        { nome: 'Usuário 4', vendas: 2000 },
        { nome: 'Usuário 5', vendas: 1000 },
      ];
    },
  });

  if (isLoadingProdutos || isLoadingVendas) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produtosMaisVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorUsuario}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
