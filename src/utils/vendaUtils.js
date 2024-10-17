export const calcularTotalItem = (item, extras) => {
  const precoBase = item.unitPrice || item.sale_price;
  const precoExtras = Array.isArray(extras) ? extras.reduce((total, extra) => {
    return total + (extra.totalPrice || 0);
  }, 0) : 0;
  return (precoBase + precoExtras) * item.quantidade;
};

export const calcularTotal = (carrinho, desconto, valorAdicional) => {
  const subtotal = carrinho.reduce((total, item) => total + calcularTotalItem(item, item.extras), 0);
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