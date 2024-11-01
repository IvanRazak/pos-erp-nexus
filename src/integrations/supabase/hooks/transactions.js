import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_payments')
        .select(`
          *,
          order:orders(
            id,
            order_number,
            status,
            cancelled,
            customer:customers(
              name
            )
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};