export const getSheetPrice = (product, quantity) => {
  if (!product.sheet_prices || product.sheet_prices.length === 0) {
    return product.sale_price;
  }

  const sortedPrices = [...product.sheet_prices].sort((a, b) => b.quantity - a.quantity);
  const applicablePrice = sortedPrices.find(price => quantity >= price.quantity);

  return applicablePrice ? applicablePrice.price : product.sale_price;
};