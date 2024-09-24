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
  queryFn: () => fromSupabase(supabase.from('orders').select('*')),
});

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder) => {
      // Primeiro, insira o pedido principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: newOrder.customer_id,
          total_amount: newOrder.total_amount,
          status: newOrder.status,
          delivery_date: newOrder.delivery_date,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Em seguida, insira os itens do pedido
      const orderItems = newOrder.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Por fim, insira o pagamento
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: order.id,
          amount: newOrder.total_amount,
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
