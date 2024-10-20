import { supabase } from '../lib/supabase';

export const getSheetPrice = async (productId, quantity) => {
  const { data, error } = await supabase
    .from('product_sheet_prices')
    .select('*')
    .eq('product_id', productId)
    .order('quantity', { ascending: true });

  if (error) {
    console.error('Error fetching sheet prices:', error);
    return null;
  }

  if (data && data.length > 0) {
    for (let i = data.length - 1; i >= 0; i--) {
      if (quantity >= data[i].quantity) {
        return data[i].price;
      }
    }
  }

  return null;
};

export const getExtraOptionPrice = async (extraOptionId, quantity) => {
  const { data: extraOption, error } = await supabase
    .from('extra_options')
    .select('price, quantity_prices')
    .eq('id', extraOptionId)
    .single();

  if (error) {
    console.error('Error fetching extra option:', error);
    return null;
  }

  if (extraOption && extraOption.quantity_prices) {
    const quantityPrices = extraOption.quantity_prices;
    for (let i = quantityPrices.length - 1; i >= 0; i--) {
      if (quantity >= quantityPrices[i].quantity) {
        return quantityPrices[i].price;
      }
    }
  }

  return extraOption ? extraOption.price : null;
};