import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import CarrinhoItem from './CarrinhoItem';
import { calcularTotal } from '../utils/vendaUtils';
import VendaDateTime from './venda/VendaDateTime';
import VendaPayment from './venda/VendaPayment';
import VendaAdditionalValues from './venda/VendaAdditionalValues';

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
        <VendaAdditionalValues 
          desconto={desconto}
          setDesconto={setDesconto}
          valorAdicional={valorAdicional}
          setValorAdicional={setValorAdicional}
          descricaoValorAdicional={descricaoValorAdicional}
          setDescricaoValorAdicional={setDescricaoValorAdicional}
        />

        <div className="grid grid-cols-3 gap-4">
          <VendaDateTime 
            dataEntrega={dataEntrega}
            setDataEntrega={setDataEntrega}
          />

          <VendaPayment 
            opcaoPagamento={opcaoPagamento}
            setOpcaoPagamento={setOpcaoPagamento}
            opcoesPagamento={opcoesPagamento}
            valorPago={valorPago}
            setValorPago={setValorPago}
          />
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