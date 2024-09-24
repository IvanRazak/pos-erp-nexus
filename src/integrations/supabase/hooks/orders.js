import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### orders

| name         | type                    | format                    | required |
|--------------|-------------------------|---------------------------|----------|
| id           | uuid                    | uuid                      | true     |
| customer_id  | uuid                    | uuid                      | false    |
| total_amount | numeric                 | number                    | true     |
| status       | public.order_status     | string                    | true     |
| delivery_date| date                    | string                    | false    |
| created_at   | timestamp with time zone| string                    | false    |
| updated_at   | timestamp with time zone| string                    | false    |

Foreign Key Relationships:
- customer_id references customers.id
*/

export const useOrder = (id) => useQuery({
  queryKey: ['orders', id],
  queryFn: () => fromSupabase(supabase.from('orders').select('*').eq('id', id).single()),
});

export const useOrders = () => useQuery({
  queryKey: ['orders'],
  queryFn: () => fromSupabase(supabase.from('orders').select('*')),
});

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOrder) => fromSupabase(supabase.from('orders').insert([newOrder])),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('orders').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('orders').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};