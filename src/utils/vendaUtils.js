export const calcularTotalItem = (item, extras) => {
  const precoBase = item.unitPrice || item.sale_price;
  const precoExtras = Array.isArray(extras) ? extras.reduce((total, extra) => total + extra.price, 0) : 0;
  return (precoBase + precoExtras) * item.quantidade;
};

export const calcularTotal = (carrinho, desconto) => {
  const subtotal = carrinho.reduce((total, item) => total + item.total, 0);
  return Math.max(subtotal - (desconto || 0), 0); // Ensure total is not negative
};

export const resetCarrinho = (setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago) => {
  setCarrinho([]);
  setClienteSelecionado(null);
  setDataEntrega(null);
  setOpcaoPagamento('');
  setDesconto(0);
  setValorPago(0);
};