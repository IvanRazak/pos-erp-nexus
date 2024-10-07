import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const ensureValidOptions = (options) => {
  if (Array.isArray(options)) {
    return options;
  }
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  return [];
};

export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: () => fromSupabase(supabase.from('extra_options').select('*').eq('id', id).single()),
});

export const useExtraOptions = () => useQuery({
  queryKey: ['extra_options'],
  queryFn: async () => {
    const data = await fromSupabase(supabase.from('extra_options').select('*'));
    return data.map(option => ({
      ...option,
      options: ensureValidOptions(option.options)
    }));
  },
});

export const useAddExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newExtraOption) => {
      const validOptions = ensureValidOptions(newExtraOption.options);
      return fromSupabase(supabase.from('extra_options').insert([{
        ...newExtraOption,
        options: validOptions
      }]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

export const useUpdateExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => {
      const validOptions = ensureValidOptions(updateData.options);
      return fromSupabase(supabase.from('extra_options').update({
        ...updateData,
        options: validOptions
      }).eq('id', id));
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
      await supabase.from('order_item_extras').delete().eq('extra_option_id', id);
      return fromSupabase(supabase.from('extra_options').delete().eq('id', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};