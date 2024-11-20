export const calcularSubtotalItem = (item) => {
  const precoUnitarioBase = item.unit_price;
  const precoExtras = item.extras.reduce((sum, extra) => sum + extra.extra_option.price, 0);
  const precoUnitarioTotal = precoUnitarioBase + precoExtras;
  return item.quantity * precoUnitarioTotal;
};

export const formatarDimensoes = (item) => {
  return item.width && item.height ? `${item.width}m x ${item.height}m` : 'N/A';
};

export const formatarM2 = (item) => {
  return item.m2 ? `${item.m2.toFixed(2)}m²` : 'N/A';
};