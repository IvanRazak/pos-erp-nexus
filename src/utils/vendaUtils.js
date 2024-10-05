export const calcularTotalItem = (item, extras) => {
  const precoBase = item.unit_type === 'square_meter' ? item.sale_price * item.m2 : item.sale_price;
  const precoExtras = Array.isArray(extras) ? extras.reduce((total, extra) => total + extra.price, 0) : 0;
  return (precoBase + precoExtras) * item.quantidade;
};

export const calcularTotal = (carrinho) => {
  return carrinho.reduce((total, item) => total + item.total, 0);
};

export const resetCarrinho = (setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago) => {
  setCarrinho([]);
  setClienteSelecionado(null);
  setDataEntrega(null);
  setOpcaoPagamento('');
  setDesconto(0);
  setValorPago(0);
};

export const handleAdicionarAoCarrinhoComExtras = (produtoSelecionado, extrasEscolhidas, setCarrinho) => {
  const novoItem = {
    ...produtoSelecionado,
    cartItemId: Date.now().toString(),
    extras: extrasEscolhidas,
    total: calcularTotalItem(produtoSelecionado, extrasEscolhidas),
  };
  setCarrinho(prevCarrinho => [...prevCarrinho, novoItem]);
};

export const prepararNovaVenda = (clienteSelecionado, calcularTotal, valorPago, dataEntrega, opcaoPagamento, carrinho, user, desconto) => {
  const totalVenda = calcularTotal();
  const saldoRestante = totalVenda - valorPago;
  return {
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
      unit_price: item.unit_type === 'square_meter' ? item.sale_price * item.m2 : item.sale_price,
      extras: item.extras,
      width: item.largura,
      height: item.altura,
      m2: item.m2,
      cartItemId: item.cartItemId,
    })),
    created_by: user.username,
    discount: parseFloat(desconto) || 0,
  };
};