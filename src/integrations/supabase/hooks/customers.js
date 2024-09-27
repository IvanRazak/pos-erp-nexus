import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useCustomer = (id) => useQuery({
  queryKey: ['customers', id],
  queryFn: () => fromSupabase(supabase.from('customers').select('*').eq('id', id).single()),
});

export const useCustomers = () => useQuery({
  queryKey: ['customers'],
  queryFn: () => fromSupabase(supabase.from('customers').select('*')),
});

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCustomer) => {
      // Check if a customer with the same email already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', newCustomer.email)
        .single();

      if (existingCustomer) {
        throw new Error('A customer with this email already exists.');
      }

      // If no existing customer, proceed with insertion
      return fromSupabase(supabase.from('customers').insert([newCustomer]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('customers').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('customers').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};