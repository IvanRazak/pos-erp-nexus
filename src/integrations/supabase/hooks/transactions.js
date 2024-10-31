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
        `);

      if (error) throw error;
      
      // Filtra os pedidos cancelados após receber os dados
      return data.filter(payment => payment.order?.status !== 'cancelled');
    },
  });
};