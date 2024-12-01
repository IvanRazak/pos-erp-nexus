import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import CarrinhoItem from './CarrinhoItem';
import { calcularTotal } from '../utils/vendaUtils';

const VendaCarrinho = ({ 
  carrinho, 
  onDelete, 
  onEdit, 
  desconto, 
  setDesconto, 
  dataEntrega, 
  setDataEntrega, 
  opcaoPagamento, 
  setOpcaoPagamento, 
  opcoesPagamento, 
  valorPago, 
  setValorPago, 
  finalizarVenda, 
  onDescriptionChange,
  valorAdicional,
  setValorAdicional,
  descricaoValorAdicional,
  setDescricaoValorAdicional,
  onUnitPriceChange,
  onQuantityChange,
  onDiscountChange
}) => {
  const [total, setTotal] = useState(0);
  const [selectedTime, setSelectedTime] = useState('12:00');

  const handleDateTimeSelect = (date) => {
    if (!date) return;
    
    const [hours, minutes] = selectedTime.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    setDataEntrega(newDate);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    if (dataEntrega) {
      const [hours, minutes] = e.target.value.split(':');
      const newDate = new Date(dataEntrega);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDataEntrega(newDate);
    }
  };

  const calcularTotalDescontos = () => {
    const descontosIndividuais = carrinho.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
    const descontoGeral = parseFloat(desconto) || 0;
    return descontosIndividuais + descontoGeral;
  };

  useEffect(() => {
    const updateTotal = async () => {
      const calculatedTotal = await calcularTotal(carrinho);
      setTotal(calculatedTotal - (desconto || 0) + (valorAdicional || 0));
    };
    updateTotal();
  }, [carrinho, desconto, valorAdicional]);

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2">Carrinho</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Medida</TableHead>
            <TableHead>M²</TableHead>
            <TableHead>Preço Unitário</TableHead>
            <TableHead>Extras</TableHead>
            <TableHead>Arte</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carrinho.map((item, index) => (
            <CarrinhoItem
              key={index}
              item={item}
              onDelete={onDelete}
              onEdit={onEdit}
              onDescriptionChange={onDescriptionChange}
              onUnitPriceChange={onUnitPriceChange}
              onQuantityChange={onQuantityChange}
              onDiscountChange={onDiscountChange}
            />
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Desconto Geral (R$)</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={desconto} 
              onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Adicional (R$)</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={valorAdicional} 
              onChange={(e) => setValorAdicional(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição do Valor Adicional</label>
            <Input 
              type="text" 
              placeholder="Ex: Taxa de entrega" 
              value={descricaoValorAdicional} 
              onChange={(e) => setDescricaoValorAdicional(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data e Hora de Entrega</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !dataEntrega && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataEntrega ? format(dataEntrega, "PPP") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dataEntrega} onSelect={handleDateTimeSelect} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="w-[120px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Forma de Pagamento</label>
            <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {opcoesPagamento?.map((opcao) => (
                  <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Pago (R$)</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={valorPago} 
              onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
          <p className="text-lg">Total Descontos (Individuais + Geral): R$ {calcularTotalDescontos().toFixed(2)}</p>
          <p className="text-lg">Valor Adicional: R$ {valorAdicional.toFixed(2)}</p>
          <p className="text-xl font-bold">Total: R$ {total.toFixed(2)}</p>
          <p className="text-xl font-bold">Saldo Restante: R$ {Math.max(total - valorPago, 0).toFixed(2)}</p>
          <Button onClick={finalizarVenda} className="w-full mt-4">Finalizar Venda</Button>
        </div>
      </div>
    </div>
  );
};

export default VendaCarrinho;
