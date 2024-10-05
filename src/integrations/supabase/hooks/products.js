import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useProduct = (id) => useQuery({
  queryKey: ['products', id],
  queryFn: () => fromSupabase(supabase.from('products').select('*').eq('id', id).single()),
});

export const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: () => fromSupabase(supabase.from('products').select('*')),
});

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct) => fromSupabase(supabase.from('products').insert([newProduct])),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('products').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('products').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};