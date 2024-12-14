import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useWebhookSettings = () => {
  return useQuery({
    queryKey: ['webhookSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateWebhookSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ webhook_url }) => {
      const { data, error } = await supabase
        .from('webhook_settings')
        .update({ webhook_url, updated_at: new Date().toISOString() })
        .eq('id', (await supabase.from('webhook_settings').select('id').single()).data.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['webhookSettings']);
    }
  });
};
