import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import CarrinhoItem from './CarrinhoItem';
import VendaCarrinhoSummary from './venda/VendaCarrinhoSummary';
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
    if (!selectedTime) {
      toast.error("A Hora deve ser preenchida");
      return;
    }

    if (!dataEntrega) {
      toast.error("Por favor, selecione uma data primeiro");
      return;
    }

    if (selectedTime === "00:00") {
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

  const handleFinalizarVenda = () => {
    if (!dataEntrega) {
      toast.error("Por favor, selecione a data e hora de entrega");
      return;
    }
    
    const time = dataEntrega.toTimeString().slice(0,5);
    if (time === "00:00") {
      toast.error("A Hora deve ser preenchida");
      return;
    }
    
    finalizarVenda();
  };

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
      
      <VendaCarrinhoSummary
        desconto={desconto}
        setDesconto={setDesconto}
        valorAdicional={valorAdicional}
        setValorAdicional={setValorAdicional}
        descricaoValorAdicional={descricaoValorAdicional}
        setDescricaoValorAdicional={setDescricaoValorAdicional}
        dataEntrega={dataEntrega}
        setDataEntrega={setDataEntrega}
        opcaoPagamento={opcaoPagamento}
        setOpcaoPagamento={setOpcaoPagamento}
        opcoesPagamento={opcoesPagamento}
        valorPago={valorPago}
        setValorPago={setValorPago}
        total={total}
        handleDateChange={handleDateChange}
        handleTimeChange={handleTimeChange}
        finalizarVenda={handleFinalizarVenda}
      />
    </div>
  );
};

export default VendaCarrinho;