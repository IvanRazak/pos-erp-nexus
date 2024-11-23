import { supabase } from '../lib/supabase';

export const getExtraOptionPrice = async (extraOption, quantity) => {
  if (extraOption.use_quantity_pricing) {
    const { data: quantityPrices } = await supabase
      .from('extra_option_quantity_prices')
      .select('*')
      .eq('extra_option_id', extraOption.id)
      .order('quantity', { ascending: true });

    if (quantityPrices && quantityPrices.length > 0) {
      for (let i = quantityPrices.length - 1; i >= 0; i--) {
        if (quantity >= quantityPrices[i].quantity) {
          return extraOption.type === 'number' 
            ? quantityPrices[i].price * (extraOption.value || 1)
            : quantityPrices[i].price;
        }
      }
    }
  }

  // Para opções do tipo select, retornamos o valor da opção selecionada
  if (extraOption.type === 'select' && extraOption.totalPrice) {
    return extraOption.totalPrice;
  }
  
  return extraOption.type === 'number' 
    ? extraOption.price * (extraOption.value || 1)
    : extraOption.price;
};

export const calcularTotalItem = async (item, extras) => {
  const precoBase = item.unitPrice || item.sale_price;
  let precoExtras = 0;
  
  if (Array.isArray(extras)) {
    for (const extra of extras) {
      const preco = await getExtraOptionPrice(extra, item.quantidade);
      if (extra.fixed_value) {
        precoExtras += preco;
      } else {
        precoExtras += preco * item.quantidade;
      }
    }
  }
  
  return (precoBase * item.quantidade) + precoExtras;
};

export const calcularTotal = async (carrinho) => {
  let total = 0;
  
  for (const item of carrinho) {
    const itemTotal = await calcularTotalItem(item, item.extras);
    const discount = parseFloat(item.discount) || 0;
    total += itemTotal - discount;
  }
  
  return total;
};

export const resetCarrinho = (setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago) => {
  setCarrinho([]);
  setClienteSelecionado(null);
  setDataEntrega(null);
  setOpcaoPagamento('');
  setDesconto(0);
  setValorPago(0);
};

export const handleFinalizarVenda = async ({
  clienteSelecionado,
  carrinho,
  dataEntrega,
  opcaoPagamento,
  valorPago,
  desconto,
  valorAdicional,
  descricaoValorAdicional,
  user,
  addOrder,
  format,
  toast,
  onSuccess,
  onError
}) => {
  const erros = [];
  if (!clienteSelecionado) erros.push("Selecione um cliente");
  if (carrinho.length === 0) erros.push("O carrinho está vazio");
  if (!dataEntrega) erros.push("Defina uma data de entrega");
  if (!opcaoPagamento) erros.push("Selecione uma opção de pagamento");
  if (valorPago <= 0) erros.push("Insira um valor pago maior que zero");
  
  if (erros.length > 0) {
    toast.error("Não foi possível finalizar a venda:\n\n" + erros.join("\n"));
    return null;
  }
  
  if (!user) {
    toast.error("Erro ao finalizar venda: Usuário não está autenticado.");
    return null;
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

    const { data, error } = await addOrder.mutateAsync(novaVenda);
    
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Erro ao criar pedido: Nenhum dado retornado');
    }

    onSuccess(data[0], carrinho);
    return { pedido: data[0], carrinho };
  } catch (error) {
    onError(error);
    return null;
  }
};
