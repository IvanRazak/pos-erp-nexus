import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useAddEventLog = () => {
  return useMutation({
    mutationFn: (newLog) => fromSupabase(supabase.from('events_log').insert([newLog])),
  });
};