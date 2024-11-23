import { calcularTotalItem } from './vendaUtils';
import { getSheetPrice } from './productUtils';

export const updateCartItemTotal = async (item) => {
  const total = await calcularTotalItem(item, item.extras);
  return { ...item, total };
};

export const updateCartItemWithNewPrice = async (item, newUnitPrice) => {
  const updatedItem = {
    ...item,
    unitPrice: newUnitPrice,
  };
  return await updateCartItemTotal(updatedItem);
};

export const updateCartItemWithNewQuantity = async (item, newQuantity) => {
  let newUnitPrice = item.unitPrice;
  
  if (item.unit_type === 'sheets') {
    const sheetPrice = await getSheetPrice(item.id, newQuantity);
    if (sheetPrice) {
      newUnitPrice = sheetPrice;
    }
  }

  const updatedItem = {
    ...item,
    quantidade: newQuantity,
    unitPrice: newUnitPrice,
  };
  
  return await updateCartItemTotal(updatedItem);
};