import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders(
            id,
            order_number,
            status,
            customer:customers(
              name
            )
          )
        `)
        .filter('order.status', 'neq', 'cancelled')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};