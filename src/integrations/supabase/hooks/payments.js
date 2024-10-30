import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '@/hooks/useAuth';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const usePayment = (id) => useQuery({
  queryKey: ['payments', id],
  queryFn: () => fromSupabase(supabase.from('payments').select('*').eq('id', id).single()),
});

export const usePayments = () => useQuery({
  queryKey: ['payments'],
  queryFn: () => fromSupabase(supabase.from('payments').select('*')),
});

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPayment) => fromSupabase(supabase.from('payments').insert([newPayment])),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('payments').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('payments').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
    },
  });
};

export const useTransactions = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          order:orders(order_number, customer:customers(name), cancelled)
        `)
        .order('payment_date', { ascending: false });

      // Se não for admin, filtrar transações de pedidos não cancelados
      if (!isAdmin) {
        query = query.eq('order.cancelled', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filtrar transações de pedidos cancelados do resultado
      if (!isAdmin) {
        return data.filter(transaction => !transaction.order?.cancelled);
      }

      return data;
    },
  });
};
