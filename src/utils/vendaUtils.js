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
