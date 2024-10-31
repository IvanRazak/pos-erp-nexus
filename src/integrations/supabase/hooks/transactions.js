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
          order:orders!inner(
            id,
            order_number,
            status,
            customer:customers(
              name
            )
          )
        `)
        .not('order_id', 'in', (
          supabase
            .from('orders')
            .select('id')
            .eq('status', 'cancelled')
        ))
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};