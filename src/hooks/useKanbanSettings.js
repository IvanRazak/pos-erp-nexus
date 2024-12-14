import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useKanbanSettings = () => {
  return useQuery({
    queryKey: ['kanbanSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_settings')
        .select('*')
        .single();

      if (error) {
        // Se não encontrar configurações, retorna valores padrão
        if (error.code === 'PGRST116') {
          return {
            late_orders_highlight: false,
            warning_hours: 0
          };
        }
        throw error;
      }

      return data;
    }
  });
};

export const useUpdateKanbanSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      const { data, error } = await supabase
        .from('kanban_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kanbanSettings']);
    }
  });
};
