import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ptBR } from 'date-fns/locale';

const PedidosFiltros = ({ filters, setFilters }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Input
        placeholder="Filtrar por nome do cliente"
        value={filters.cliente}
        onChange={(e) => setFilters({...filters, cliente: e.target.value})}
      />
      <Input
        placeholder="Filtrar por número do pedido"
        value={filters.numeroPedido}
        onChange={(e) => setFilters({...filters, numeroPedido: e.target.value})}
      />
      <div className="flex space-x-2">
        <DatePicker
          selected={filters.dataInicio}
          onChange={(date) => setFilters({...filters, dataInicio: date})}
          placeholderText="Data Início"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
        <DatePicker
          selected={filters.dataFim}
          onChange={(date) => setFilters({...filters, dataFim: date})}
          placeholderText="Data Fim"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />
      </div>
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
      <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="in_production">Em Produção</SelectItem>
          <SelectItem value="awaiting_approval">Aguardando Aprovação</SelectItem>
          <SelectItem value="ready_for_pickup">Pronto para Retirada</SelectItem>
          <SelectItem value="delivered">Entregue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PedidosFiltros;