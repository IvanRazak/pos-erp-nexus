export const calcularSubtotalItem = (item) => {
  const precoUnitarioBase = item.unit_price;
  const precoExtras = item.extras.reduce((sum, extra) => sum + extra.extra_option.price, 0);
  const precoUnitarioTotal = precoUnitarioBase + precoExtras;
  return item.quantity * precoUnitarioTotal;
};

export const formatarDimensoes = (item) => {
  if (!item.product) return 'N/A';
  
  if (item.product.unit_type === 'square_meter') {
    return item.width && item.height ? `${item.width}m *Largura* x ${item.height}m *Altura*` : 'N/A';
  }
  
  return item.product.format || 'N/A';
};

export const formatarM2 = (item) => {
  return item.m2 ? `${item.m2.toFixed(2)}m²` : 'N/A';
};
