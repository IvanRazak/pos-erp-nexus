import React from 'react';
import { Button } from "@/components/ui/button";
import { handlePrintPedido } from '../../utils/vendaPrintUtils';
import { toast } from "sonner";
import { useAddOrder } from '../../integrations/supabase';
import { format } from "date-fns";
import { calcularTotal } from '../../utils/vendaUtils';

const VendaFinalizacao = ({
  carrinho,
  clienteSelecionado,
  dataEntrega,
  opcaoPagamento,
  valorPago,
  desconto,
  valorAdicional,
  descricaoValorAdicional,
  user,
  onSuccess
}) => {
  const addOrder = useAddOrder();

  const finalizarVenda = async () => {
    const erros = [];
    if (!clienteSelecionado) erros.push("Selecione um cliente");
    if (carrinho.length === 0) erros.push("O carrinho está vazio");
    if (!dataEntrega) erros.push("Defina uma data de entrega");
    if (!opcaoPagamento) erros.push("Selecione uma opção de pagamento");
    if (valorPago <= 0) erros.push("Insira um valor pago maior que zero");
    
    if (erros.length > 0) {
      toast.error("Não foi possível finalizar a venda:\n\n" + erros.join("\n"));
      return;
    }
    
    if (!user) {
      toast.error("Erro ao finalizar venda: Usuário não está autenticado.");
      return;
    }

    try {
      const totalVenda = await calcularTotal(carrinho) - parseFloat(desconto) + parseFloat(valorAdicional);
      const saldoRestante = totalVenda - valorPago;

      const novaVenda = {
        customer_id: clienteSelecionado,
        total_amount: totalVenda,
        paid_amount: valorPago,
        remaining_balance: saldoRestante,
        status: saldoRestante > 0 ? 'partial_payment' : 'in_production',
        delivery_date: format(dataEntrega, 'yyyy-MM-dd'),
        payment_option: opcaoPagamento,
        items: carrinho.map(item => ({
          product_id: item.id,
          quantity: item.quantidade,
          unit_price: item.unitPrice || item.sale_price,
          extras: item.extras,
          width: item.largura,
          height: item.altura,
          m2: item.m2,
          cartItemId: item.cartItemId,
          description: item.description,
          arte_option: item.arteOption || null,
          discount: parseFloat(item.discount) || 0,
        })),
        created_by: user.username,
        discount: parseFloat(desconto) || 0,
        additional_value: parseFloat(valorAdicional) || 0,
        additional_value_description: descricaoValorAdicional,
      };

      const novoPedido = await addOrder.mutateAsync(novaVenda);
      toast.success("Venda finalizada com sucesso!");
      
      // Imprimir o pedido após finalizar a venda
      await handlePrintPedido(novoPedido, novaVenda.items);
      
      onSuccess();
    } catch (error) {
      toast.error("Erro ao finalizar venda: " + error.message);
    }
  };

  return (
    <Button onClick={finalizarVenda} className="w-full mt-4">
      Finalizar Venda
    </Button>
  );
};

export default VendaFinalizacao;