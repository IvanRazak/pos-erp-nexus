import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ptBR } from 'date-fns/locale';

const RelatorioFilters = ({ filters, setFilters, users }) => {
  return (
    <>
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

      <div className="grid grid-cols-3 gap-4 mb-4">
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
        <Select onValueChange={(value) => setFilters({...filters, userId: value})} value={filters.userId}>
          <SelectTrigger>
            <SelectValue placeholder="Usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {users?.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default RelatorioFilters;