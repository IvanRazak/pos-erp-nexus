import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '@/hooks/useAuth';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useOrder = (id) => useQuery({
  queryKey: ['orders', id],
  queryFn: async () => {
    if (!id) return null;
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        total_amount,
        paid_amount,
        remaining_balance,
        status,
        delivery_date,
        payment_option,
        created_by,
        discount,
        additional_value,
        additional_value_description,
        created_at,
        order_number,
        cancelled,
        customer:customers(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Buscar os itens do pedido separadamente
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        product:products(*)
      `)
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    return { ...order, items: orderItems };
  },
  enabled: !!id,
});

export const useOrders = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['orders', { isAdmin }],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          total_amount,
          paid_amount,
          remaining_balance,
          status,
          delivery_date,
          payment_option,
          created_by,
          discount,
          additional_value,
          additional_value_description,
          created_at,
          order_number,
          cancelled,
          customer:customers(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar os itens de todos os pedidos em uma única consulta
      const orderIds = orders.map(order => order.id);
      const { data: allOrderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          quantity,
          unit_price,
          product:products(*)
        `)
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Associar os itens aos seus respectivos pedidos
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: allOrderItems.filter(item => item.order_id === order.id)
      }));

      if (!isAdmin) {
        return ordersWithItems.filter(order => !order.cancelled);
      }

      return ordersWithItems;
    },
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5,
  });
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId) => {
      const { error } = await supabase
        .from('orders')
        .update({ cancelled: true })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['transactions']);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};
