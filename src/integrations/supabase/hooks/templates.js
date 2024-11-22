import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useTemplates = (type) => {
  return useQuery({
    queryKey: ['templates', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('type', type)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content, styles }) => {
      const { data, error } = await supabase
        .from('templates')
        .update({ content, styles, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['templates', data.type]);
    },
  });
};