import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const usePaymentOption = (id) => useQuery({
  queryKey: ['payment_options', id],
  queryFn: () => fromSupabase(supabase.from('payment_options').select('*').eq('id', id).single()),
});

export const usePaymentOptions = () => useQuery({
  queryKey: ['payment_options'],
  queryFn: () => fromSupabase(supabase.from('payment_options').select('*')),
});

export const useAddPaymentOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPaymentOption) => fromSupabase(supabase.from('payment_options').insert([newPaymentOption])),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment_options']);
    },
  });
};

export const useUpdatePaymentOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('payment_options').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment_options']);
    },
  });
};

export const useDeletePaymentOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('payment_options').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment_options']);
    },
  });
};

export const useTransactions = () => useQuery({
  queryKey: ['transactions'],
  queryFn: () => fromSupabase(supabase
    .from('payments')
    .select(`
      *,
      order:orders(order_number, status, customer:customers(name))
    `)
    .order('payment_date', { ascending: false })
  ),
});
