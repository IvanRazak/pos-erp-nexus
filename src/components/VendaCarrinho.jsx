import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
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

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (selectedDate) {
      const newDate = new Date(selectedDate + 'T00:00');
      setDataEntrega(newDate);
    } else {
      setDataEntrega(null);
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (!selectedTime) return;

    if (!dataEntrega) {
      toast.error("Por favor, selecione uma data primeiro");
      return;
    }

    if (selectedTime === '00:00') {
      toast.error("A Hora deve ser preenchida");
      return;
    }

    const currentDate = dataEntrega.toISOString().split('T')[0];
    const newDateTime = new Date(currentDate + 'T' + selectedTime);
    setDataEntrega(newDateTime);
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
      <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de Entrega</label>
            <Input
              type="date"
              value={dataEntrega ? dataEntrega.toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hora de Entrega</label>
            <Input
              type="time"
              value={dataEntrega ? dataEntrega.toTimeString().slice(0,5) : ''}
              onChange={handleTimeChange}
              className="w-full"
              required
            />
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
          <Button 
            onClick={() => {
              if (!dataEntrega) {
                toast.error("Por favor, selecione a data e hora de entrega");
                return;
              }
              finalizarVenda();
            }} 
            className="w-full mt-4"
          >
            Finalizar Venda
          </Button>
        </div>
    </div>
  );
};

export default VendaCarrinho;
