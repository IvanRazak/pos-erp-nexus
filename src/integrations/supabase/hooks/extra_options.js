import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: async () => {
    const extraOption = await fromSupabase(supabase.from('extra_options').select('*').eq('id', id).single());
    const quantityPrices = await fromSupabase(supabase.from('extra_option_quantity_prices').select('*').eq('extra_option_id', id));
    return { ...extraOption, quantityPrices };
  },
});

export const useExtraOptions = () => useQuery({
  queryKey: ['extra_options'],
  queryFn: async () => {
    const extraOptions = await fromSupabase(supabase.from('extra_options').select('*'));
    const quantityPrices = await fromSupabase(supabase.from('extra_option_quantity_prices').select('*'));
    return extraOptions.map(option => ({
      ...option,
      quantityPrices: quantityPrices.filter(qp => qp.extra_option_id === option.id)
    }));
  }
});

export const useAddExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newExtraOption) => {
      const { quantityPrices, ...extraOptionData } = newExtraOption;
      const { data: extraOption, error } = await supabase.from('extra_options').insert([extraOptionData]).select().single();
      if (error) throw error;

      if (quantityPrices && quantityPrices.length > 0) {
        const { error: quantityPricesError } = await supabase.from('extra_option_quantity_prices').insert(
          quantityPrices.map(qp => ({ ...qp, extra_option_id: extraOption.id }))
        );
        if (quantityPricesError) throw quantityPricesError;
      }

      return extraOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useUpdateExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { quantityPrices, ...extraOptionData } = updateData;
      const { data: extraOption, error } = await supabase.from('extra_options').update(extraOptionData).eq('id', id).select().single();
      if (error) throw error;

      if (quantityPrices) {
        await supabase.from('extra_option_quantity_prices').delete().eq('extra_option_id', id);
        if (quantityPrices.length > 0) {
          const { error: quantityPricesError } = await supabase.from('extra_option_quantity_prices').insert(
            quantityPrices.map(qp => ({ ...qp, extra_option_id: id }))
          );
          if (quantityPricesError) throw quantityPricesError;
        }
      }

      return extraOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useDeleteExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await supabase.from('extra_option_quantity_prices').delete().eq('extra_option_id', id);
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