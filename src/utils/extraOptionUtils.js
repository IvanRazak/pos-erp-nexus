import { supabase } from '../lib/supabase';

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
    // Find the highest quantity tier that's less than or equal to the current quantity
    for (let i = data.length - 1; i >= 0; i--) {
      if (quantity >= data[i].quantity) {
        return data[i].price;
      }
    }
  }

  return null;
};