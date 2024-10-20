export const getSheetPrice = (sheetPrices, quantity) => {
  if (!Array.isArray(sheetPrices) || sheetPrices.length === 0) {
    return null;
  }

  const sortedPrices = [...sheetPrices].sort((a, b) => b.quantity - a.quantity);
  for (const price of sortedPrices) {
    if (quantity >= price.quantity) {
      return price.price;
    }
  }

  return sortedPrices[sortedPrices.length - 1].price;
};