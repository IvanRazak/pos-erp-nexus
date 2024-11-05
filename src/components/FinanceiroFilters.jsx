import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ptBR } from 'date-fns/locale';

const FinanceiroFilters = ({ filters, setFilters, opcoesPagamento }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
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
      <Select onValueChange={(value) => setFilters({...filters, opcaoPagamento: value})} value={filters.opcaoPagamento}>
        <SelectTrigger>
          <SelectValue placeholder="Opção de Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {opcoesPagamento?.map((option) => (
            <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    </div>
  );
};

export default FinanceiroFilters;