import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useOrderStatusSettings = () => {
  return useQuery({
    queryKey: ['orderStatusSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateOrderStatusSettings = () => {
  return useMutation({
    mutationFn: async (settings) => {
      const { data, error } = await supabase
        .from('order_status_settings')
        .upsert({
          id: 1, // Using a fixed ID since we only need one settings record
          full_payment_status: settings.fullPaymentStatus,
          partial_payment_status: settings.partialPaymentStatus,
          zero_payment_status: settings.zeroPaymentStatus,
          allow_zero_payment: settings.allowZeroPayment
        });

      if (error) throw error;
      return data;
    }
  });
};