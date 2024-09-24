import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### order_item_extras

| name           | type                    | format                    | required |
|----------------|-------------------------|---------------------------|----------|
| id             | uuid                    | uuid                      | true     |
| order_item_id  | uuid                    | uuid                      | false    |
| extra_option_id| uuid                    | uuid                      | false    |
| created_at     | timestamp with time zone| string                    | false    |
| updated_at     | timestamp with time zone| string                    | false    |

Foreign Key Relationships:
- order_item_id references order_items.id
- extra_option_id references extra_options.id
*/

export const useOrderItemExtra = (id) => useQuery({
  queryKey: ['order_item_extras', id],
  queryFn: () => fromSupabase(supabase.from('order_item_extras').select('*').eq('id', id).single()),
});

export const useOrderItemExtras = () => useQuery({
  queryKey: ['order_item_extras'],
  queryFn: () => fromSupabase(supabase.from('order_item_extras').select('*')),
});

export const useAddOrderItemExtra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOrderItemExtra) => fromSupabase(supabase.from('order_item_extras').insert([newOrderItemExtra])),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_item_extras']);
    },
  });
};

export const useUpdateOrderItemExtra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('order_item_extras').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_item_extras']);
    },
  });
};

export const useDeleteOrderItemExtra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('order_item_extras').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['order_item_extras']);
    },
  });
};