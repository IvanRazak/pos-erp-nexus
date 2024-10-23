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
          return quantityPrices[i].price;
        }
      }
    }
  }
  return extraOption.price;
};

export const calcularTotalItem = async (item, extras) => {
  const precoBase = item.unitPrice || item.sale_price;
  let precoExtras = 0;
  
  if (Array.isArray(extras)) {
    for (const extra of extras) {
      const preco = await getExtraOptionPrice(extra, item.quantidade);
      precoExtras += preco;
    }
  }
  
  return (precoBase + precoExtras) * item.quantidade;
};

export const calcularTotal = async (carrinho) => {
  let total = 0;
  for (const item of carrinho) {
    total += await calcularTotalItem(item, item.extras);
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