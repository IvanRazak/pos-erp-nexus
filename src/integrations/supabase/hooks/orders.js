import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useOrder = (id) => useQuery({
  queryKey: ['orders', id],
  queryFn: () => fromSupabase(supabase.from('orders').select('*').eq('id', id).single()),
});

export const useOrders = () => useQuery({
  queryKey: ['orders'],
  queryFn: () => fromSupabase(supabase.from('orders').select('*, customer:customers(name)').order('created_at', { ascending: false })),
});

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder) => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: newOrder.customer_id,
          total_amount: newOrder.total_amount,
          paid_amount: newOrder.paid_amount,
          remaining_balance: newOrder.remaining_balance,
          status: newOrder.status,
          delivery_date: newOrder.delivery_date,
          payment_option: newOrder.payment_option,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = newOrder.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        width: item.width || null,
        height: item.height || null,
        m2: item.m2 || null,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      const extraOptions = newOrder.items.flatMap(item => 
        item.extras.map(extra => ({
          order_item_id: insertedItems.find(i => i.product_id === item.product_id).id,
          extra_option_id: extra.id,
        }))
      );

      if (extraOptions.length > 0) {
        const { error: extrasError } = await supabase
          .from('order_item_extras')
          .insert(extraOptions);

        if (extrasError) throw extrasError;
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: order.id,
          amount: newOrder.paid_amount,
          payment_option: newOrder.payment_option,
        }]);

      if (paymentError) throw paymentError;

      return order;
    },
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
