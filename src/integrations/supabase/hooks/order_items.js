import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### order_items

| name       | type                    | format                    | required |
|------------|-------------------------|---------------------------|----------|
| id         | uuid                    | uuid                      | true     |
| order_id   | uuid                    | uuid                      | false    |
| product_id | uuid                    | uuid                      | false    |
| quantity   | numeric                 | number                    | true     |
| unit_price | numeric                 | number                    | true     |
| created_at | timestamp with time zone| string                    | false    |
| updated_at | timestamp with time zone| string                    | false    |

Foreign Key Relationships:
- order_id references orders.id
- product_id references products.id
*/

export const useOrderItem = (id) => useQuery({
  queryKey: ['order_items', id],
  queryFn: () => fromSupabase(supabase.from('order_items').select('*').eq('id', id).single()),
});

export const useOrderItems = () => useQuery({
  queryKey: ['order_items'],
  queryFn: () => fromSupabase(supabase.from('order_items').select('*')),
});

export const useAddOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOrderItem) => fromSupabase(supabase.from('order_items').insert([newOrderItem])),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_items']);
    },
  });
};

export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('order_items').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_items']);
    },
  });
};

export const useDeleteOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('order_items').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_items']);
    },
  });
};