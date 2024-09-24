import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### customers

| name          | type                    | format                    | required |
|---------------|-------------------------|---------------------------|----------|
| id            | uuid                    | uuid                      | true     |
| name          | text                    | string                    | true     |
| email         | text                    | string                    | false    |
| phone         | text                    | string                    | false    |
| address       | text                    | string                    | false    |
| customer_type | text                    | string                    | false    |
| created_at    | timestamp with time zone| string                    | false    |
| updated_at    | timestamp with time zone| string                    | false    |
*/

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
    mutationFn: (newCustomer) => fromSupabase(supabase.from('customers').insert([newCustomer])),
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