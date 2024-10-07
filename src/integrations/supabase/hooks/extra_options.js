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
  queryFn: () => fromSupabase(supabase.from('selection_options').select('*, items:selection_option_items(*)'))
});

export const useAddSelectionOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSelectionOption) => {
      const { data: selectionOption, error: selectionError } = await supabase
        .from('selection_options')
        .insert([{ name: newSelectionOption.name }])
        .select()
        .single();

      if (selectionError) throw new Error(selectionError.message);

      const items = newSelectionOption.items.map(item => ({
        selection_option_id: selectionOption.id,
        name: item.name,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('selection_option_items')
        .insert(items);

      if (itemsError) throw new Error(itemsError.message);

      return selectionOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['selection_options']);
    },
  });
};

export const useUpdateSelectionOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, items }) => {
      const { error: updateError } = await supabase
        .from('selection_options')
        .update({ name })
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);

      const { error: deleteError } = await supabase
        .from('selection_option_items')
        .delete()
        .eq('selection_option_id', id);

      if (deleteError) throw new Error(deleteError.message);

      const newItems = items.map(item => ({
        selection_option_id: id,
        name: item.name,
        price: item.price
      }));

      const { error: insertError } = await supabase
        .from('selection_option_items')
        .insert(newItems);

      if (insertError) throw new Error(insertError.message);
    },
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
