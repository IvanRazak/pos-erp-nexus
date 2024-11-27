import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useAddEventLog = () => {
  return useMutation({
    mutationFn: async (newLog) => {
      const ipAddress = !newLog.ip_address ? await getIpAddress() : newLog.ip_address;
      return fromSupabase(supabase.from('events_log').insert([{
        ...newLog,
        ip_address: ipAddress
      }]));
    },
  });
};

export const useEventsLog = () => {
  return useQuery({
    queryKey: ['events_log'],
    queryFn: () => fromSupabase(
      supabase
        .from('events_log')
        .select('*')
        .order('event_date', { ascending: false })
    ),
  });
};