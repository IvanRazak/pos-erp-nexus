import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ['system_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAddSystemLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logData) => {
      const { data, error } = await supabase
        .from('system_logs')
        .insert([logData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['system_logs']);
    },
  });
};