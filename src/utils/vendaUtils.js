import { getExtraOptionPrice } from './extraOptionUtils';

export const calcularTotalItem = async (item, extras) => {
  const precoBase = item.unitPrice || item.sale_price;
  let precoExtras = 0;
  
  if (Array.isArray(extras)) {
    for (const extra of extras) {
      let extraPrice = extra.totalPrice || 0;
      
      if (extra.use_quantity_pricing) {
        const quantityPrice = await getExtraOptionPrice(extra.id, item.quantidade);
        if (quantityPrice !== null) {
          extraPrice = quantityPrice;
          if (extra.type === 'number') {
            extraPrice *= parseFloat(extra.value);
          }
        }
      }
      
      precoExtras += extraPrice;
    }
  }
  
  return (precoBase + precoExtras) * item.quantidade;
};

export const calcularTotal = async (carrinho, desconto, valorAdicional) => {
  let subtotal = 0;
  for (const item of carrinho) {
    subtotal += await calcularTotalItem(item, item.extras);
  }
  return Math.max(subtotal - (desconto || 0) + (valorAdicional || 0), 0);
};

export const resetCarrinho = (setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago) => {
  setCarrinho([]);
  setClienteSelecionado(null);
  setDataEntrega(null);
  setOpcaoPagamento('');
  setDesconto(0);
  setValorPago(0);
};