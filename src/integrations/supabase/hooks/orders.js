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
    return fromSupabase(
      supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          items:order_items(
            id,
            quantity,
            unit_price,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single()
    );
  },
  enabled: !!id,
});

export const useOrders = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['orders', { isAdmin }],
    queryFn: async () => {
      const query = supabase
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
          cancelled,
          order_number,
          customer:customers(name),
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Filtragem no cliente para melhor performance
      if (!isAdmin) {
        return (data || []).filter(order => !order.cancelled);
      }

      return data || [];
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
