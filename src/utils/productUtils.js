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
  const { data, error } = await supabase
    .from('extra_option_quantity_prices')
    .select('*')
    .eq('extra_option_id', extraOptionId)
    .order('quantity', { ascending: true });

  if (error) {
    console.error('Error fetching extra option prices:', error);
    return null;
  }

  if (data && data.length > 0) {
    for (let i = data.length - 1; i >= 0; i--) {
      if (quantity >= data[i].quantity) {
        return data[i].price;
      }
    }
  }

  // Se não encontrar um preço específico para a quantidade, retorna o preço base
  const { data: extraOption } = await supabase
    .from('extra_options')
    .select('price')
    .eq('id', extraOptionId)
    .single();

  return extraOption ? extraOption.price : null;
};