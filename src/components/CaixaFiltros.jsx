import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { ptBR } from 'date-fns/locale';

const CaixaFiltros = ({
  filtroDataInicio,
  setFiltroDataInicio,
  filtroDataFim,
  setFiltroDataFim,
  filtroOpcaoPagamento,
  setFiltroOpcaoPagamento,
  filtroCliente,
  setFiltroCliente,
  filtroNumeroPedido,
  setFiltroNumeroPedido,
  mostrarCancelados,
  setMostrarCancelados,
  paymentOptions
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <DatePicker
        selected={filtroDataInicio}
        onChange={setFiltroDataInicio}
        placeholderText="Data Início"
        locale={ptBR}
        dateFormat="dd/MM/yyyy"
      />
      <DatePicker
        selected={filtroDataFim}
        onChange={setFiltroDataFim}
        placeholderText="Data Fim"
        locale={ptBR}
        dateFormat="dd/MM/yyyy"
      />
      <Select onValueChange={setFiltroOpcaoPagamento} value={filtroOpcaoPagamento}>
        <SelectTrigger>
          <SelectValue placeholder="Opção de Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {paymentOptions?.map((option) => (
            <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Filtrar por nome do cliente"
        value={filtroCliente}
        onChange={(e) => setFiltroCliente(e.target.value)}
      />
      <Input
        placeholder="Filtrar por número do pedido"
        value={filtroNumeroPedido}
        onChange={(e) => setFiltroNumeroPedido(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <Switch
          id="mostrar-cancelados"
          checked={mostrarCancelados}
          onCheckedChange={setMostrarCancelados}
        />
        <label htmlFor="mostrar-cancelados">
          Mostrar Pagamentos Cancelados
        </label>
      </div>
    </div>
  );
};

export default CaixaFiltros;