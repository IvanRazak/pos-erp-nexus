import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useOrderDiscounts = (orderIds) => {
  return useQuery({
    queryKey: ['orderDiscounts', orderIds],
    queryFn: async () => {
      if (!orderIds || orderIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('order_items')
        .select('order_id, discount')
        .in('order_id', orderIds);
        
      if (error) throw error;
      
      // Agrupa os descontos por order_id
      return data.reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = 0;
        }
        acc[item.order_id] += parseFloat(item.discount || 0);
        return acc;
      }, {});
    },
    enabled: orderIds?.length > 0,
  });
};