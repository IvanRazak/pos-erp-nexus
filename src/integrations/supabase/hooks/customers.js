import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const useCustomer = (id) => useQuery({
  queryKey: ['customers', id],
  queryFn: () => fromSupabase(supabase.from('customers').select('*').eq('id', id).single()),
});

export const useCustomers = () => useQuery({
  queryKey: ['customers'],
  queryFn: () => fromSupabase(supabase.from('customers').select('*')),
});

const checkWhatsAppExists = async (whatsapp, currentCustomerId = null) => {
  const query = supabase
    .from('customers')
    .select('id')
    .eq('whatsapp', whatsapp);
  
  if (currentCustomerId) {
    query.neq('id', currentCustomerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data && data.length > 0;
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCustomer) => {
      // Remove máscara do WhatsApp antes de verificar
      const cleanWhatsapp = newCustomer.whatsapp?.replace(/\D/g, '');
      
      if (cleanWhatsapp) {
        const exists = await checkWhatsAppExists(cleanWhatsapp);
        if (exists) {
          throw new Error('whatsapp_exists');
        }
      }

      return fromSupabase(supabase.from('customers').insert([newCustomer]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      // Remove máscara do WhatsApp antes de verificar
      const cleanWhatsapp = updateData.whatsapp?.replace(/\D/g, '');
      
      if (cleanWhatsapp) {
        const exists = await checkWhatsAppExists(cleanWhatsapp, id);
        if (exists) {
          throw new Error('whatsapp_exists');
        }
      }

      return fromSupabase(supabase.from('customers').update(updateData).eq('id', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('customers').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
  });
};