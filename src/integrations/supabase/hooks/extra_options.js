import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: () => fromSupabase(supabase.from('extra_options').select('*').eq('id', id).single()),
});

export const useExtraOptions = () => useQuery({
  queryKey: ['extra_options'],
  queryFn: () => fromSupabase(supabase.from('extra_options').select('*'))
});

export const useAddExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newExtraOption) => fromSupabase(supabase.from('extra_options').insert([newExtraOption])),
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useUpdateExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('extra_options').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useDeleteExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await supabase.from('order_item_extras').delete().eq('extra_option_id', id);
      return fromSupabase(supabase.from('extra_options').delete().eq('id', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useSelectionOptions = () => useQuery({
  queryKey: ['selection_options'],
  queryFn: () => fromSupabase(supabase.from('selection_options').select('*'))
});

export const useAddSelectionOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSelectionOption) => fromSupabase(supabase.from('selection_options').insert([newSelectionOption])),
    onSuccess: () => {
      queryClient.invalidateQueries(['selection_options']);
    },
  });
};

export const useUpdateSelectionOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('selection_options').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['selection_options']);
    },
  });
};

export const useDeleteSelectionOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('selection_options').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['selection_options']);
    },
  });
};

export const useExtraOptionQuantityPrices = (extraOptionId) => useQuery({
  queryKey: ['extra_option_quantity_prices', extraOptionId],
  queryFn: () => fromSupabase(supabase.from('extra_option_quantity_prices').select('*').eq('extra_option_id', extraOptionId).order('quantity', { ascending: true })),
});

export const useAddExtraOptionQuantityPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newQuantityPrice) => fromSupabase(supabase.from('extra_option_quantity_prices').insert([newQuantityPrice])),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['extra_option_quantity_prices', variables.extra_option_id]);
    },
  });
};

export const useUpdateExtraOptionQuantityPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('extra_option_quantity_prices').update(updateData).eq('id', id)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['extra_option_quantity_prices', variables.extra_option_id]);
    },
  });
};

export const useDeleteExtraOptionQuantityPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('extra_option_quantity_prices').delete().eq('id', id)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['extra_option_quantity_prices', variables.extra_option_id]);
    },
  });
};
