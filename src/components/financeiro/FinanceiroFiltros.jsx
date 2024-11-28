import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Toggle } from "@/components/ui/toggle";
import { ptBR } from 'date-fns/locale';

const FinanceiroFiltros = ({ filters, setFilters, opcoesPagamento }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
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
      </div>
      <div className="grid grid-cols-3 gap-4">
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
        <Toggle
          pressed={filters.mostrarPagos}
          onPressedChange={(pressed) => setFilters({...filters, mostrarPagos: pressed})}
          className="w-full justify-start"
        >
          Mostrar pedidos pagos
        </Toggle>
      </div>
    </div>
  );
};

export default FinanceiroFiltros;