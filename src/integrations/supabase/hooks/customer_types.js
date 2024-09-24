import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useCustomerType = (id) => useQuery({
  queryKey: ['customer_types', id],
  queryFn: () => fromSupabase(supabase.from('customer_types').select('*').eq('id', id).single()),
});

export const useCustomerTypes = () => useQuery({
  queryKey: ['customer_types'],
  queryFn: () => fromSupabase(supabase.from('customer_types').select('*')),
});

export const useAddCustomerType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCustomerType) => fromSupabase(supabase.from('customer_types').insert([newCustomerType])),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer_types']);
    },
  });
};

export const useUpdateCustomerType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('customer_types').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer_types']);
    },
  });
};

export const useDeleteCustomerType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('customer_types').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer_types']);
    },
  });
};
