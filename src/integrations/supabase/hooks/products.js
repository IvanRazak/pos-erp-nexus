import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### products

| name            | type                    | format                    | required |
|-----------------|-------------------------|---------------------------|----------|
| id              | uuid                    | uuid                      | true     |
| name            | text                    | string                    | true     |
| description     | text                    | string                    | false    |
| sale_price      | numeric                 | number                    | true     |
| cost_price      | numeric                 | number                    | true     |
| number_of_copies| integer                 | integer                   | false    |
| colors          | text                    | string                    | false    |
| format          | text                    | string                    | false    |
| print_type      | text                    | string                    | false    |
| unit_type       | public.product_unit_type| string                    | true     |
| type            | text                    | string                    | true     |
| created_at      | timestamp with time zone| string                    | false    |
| updated_at      | timestamp with time zone| string                    | false    |
*/

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