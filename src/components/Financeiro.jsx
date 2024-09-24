import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";

const Financeiro = () => {
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroOpcaoPagamento, setFiltroOpcaoPagamento] = useState('');

  const { data: contasReceber, isLoading } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, numeroPedido: '001', cliente: 'Cliente 1', valor: 150.00, dataVencimento: '2023-05-10', opcaoPagamento: 'Cartão' },
        { id: 2, numeroPedido: '002', cliente: 'Cliente 2', valor: 200.00, dataVencimento: '2023-05-15', opcaoPagamento: 'Dinheiro' },
      ];
    },
  });

  const filtrarContasReceber = () => {
    if (!contasReceber) return [];
    return contasReceber.filter(conta => {
      const matchData = (!filtroDataInicio || new Date(conta.dataVencimento) >= filtroDataInicio) &&
                        (!filtroDataFim || new Date(conta.dataVencimento) <= filtroDataFim);
      const matchOpcaoPagamento = !filtroOpcaoPagamento || conta.opcaoPagamento === filtroOpcaoPagamento;
      return matchData && matchOpcaoPagamento;
    });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Contas a Receber</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
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
        
        <Select onValueChange={setFiltroOpcaoPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <Select value="Cartão">Cartão</Select>
            <Select value="Dinheiro">Dinheiro</Select>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Opção de Pagamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrarContasReceber().map((conta) => (
            <TableRow key={conta.id}>
              <TableCell>{conta.numeroPedido}</TableCell>
              <TableCell>{conta.cliente}</TableCell>
              <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
              <TableCell>{conta.dataVencimento}</TableCell>
              <TableCell>{conta.opcaoPagamento}</TableCell>
              <TableCell>
                <Button onClick={() => {
                  // Implementar lógica para registrar pagamento
                  console.log(`Registrando pagamento da conta ${conta.id}`);
                }}>
                  Registrar Pagamento
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Financeiro;
