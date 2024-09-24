import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### payments

| name           | type                    | format                    | required |
|----------------|-------------------------|---------------------------|----------|
| id             | uuid                    | uuid                      | true     |
| order_id       | uuid                    | uuid                      | false    |
| amount         | numeric                 | number                    | true     |
| payment_option | public.payment_option   | string                    | true     |
| payment_date   | timestamp with time zone| string                    | false    |
| created_at     | timestamp with time zone| string                    | false    |
| updated_at     | timestamp with time zone| string                    | false    |

Foreign Key Relationships:
- order_id references orders.id
*/

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